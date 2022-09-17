import React, {PureComponent} from 'react';
import { ReactSVG } from 'react-svg'
import { Row, Col, Button, Tab, Nav, Accordion, Card, Form } from 'reactstrap';

import MapEditorPannel from './MapEditorPannel'



const MAP_EDITOR_WIDTH = '100%'
const MAP_EDITOR_HEIGHT = 675
const PLACES_BACKGROUND_COLOR = 'rgba(188,34,49,1)'
const PLACES_BACKGROUND_COLOR_SEL = 'rgba(230,34,49,1)'
const PLACES_BACKGROUND_COLOR_SETTED = 'rgba(40,167,69,1)'
const PLACES_BACKGROUND_COLOR_HOVER = 'rgba(230,34,49,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_SEL = 'rgba(255,255,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE = 'rgba(255,200,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_DISABLE = 'rgba(180,180,180,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_HOVER = 'rgba(255,255,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE = 'rgba(0,0,255,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_SEL = 'rgba(0,123,255,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_HOVER = 'rgba(0,123,255,1)'
const DIRECTION_BACKGROUND_COLOR_ENABLE = 'rgba(0,0,255,1)'
const DIRECTION_BACKGROUND_COLOR_DISABLE = 'rgba(180,180,180,1)'
const DIRECTION_BACKGROUND_COLOR_SEL = 'rgba(0,123,255,1)'
const DIRECTION_BACKGROUND_COLOR_HOVER = 'rgba(0,123,255,1)'
// const FINALPATH_BACKGROUND_COLOR = 'rgba(30,126,52,1)'
const FINALPATH_BACKGROUND_COLOR = 'rgba(0,0,255,1)'

const PLACE_RADIUS = 5
const DIRECTION_STROKE_WIDTH = 3
const FINALPATH_STROKE_WIDTH = 1
const STAIR_DIST = 40


export const PLACES_TYPES = ['place', 'destination','wifi', 'phone', 'entrance', 'exit', 'elevator', 'escalator', 'stair','kiosk','amenity']
export const DESTINATIONS_TYPES = ['destination', 'atm', 'wifi', 'phone','amenity']
export const CONNECTIONS_TYPES = ['entrance', 'exit', 'elevator', 'escalator', 'stair']
export const REAL_CONNECTIONS_TYPES = ['elevator', 'escalator', 'stair']
export const AMENITIES_TYPES = 'amenity'

export default class MapEditor extends PureComponent {

  constructor(props) {
    super(props);

    let map = this.props.map;

    this.state = {
      map: map,
      activePannel: 'places',
      curLevelIdx: 0,
      svg: null,
      mapZoom: 1,
      mapDragStart: false,
      mapOffset: {x: 0, y: 0},
      curPlaceId: '',
      curDirectionId: '',
      isRefresh: true,
      isPickLocation: false,
      isPickDirection: false,
      addPlaceX: 0,
      addPlaceY: 0,
      prevPathNode: null
    };

    this.loadSVG = this.loadSVG.bind(this)
    this.onPlaceMouseEnter = this.onPlaceMouseEnter.bind(this)
  }




  /********************************************************************************** */
  /****************************  React Component Callback  ************************** */
  componentDidMount() {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    this.fileSelector = fileSelector;
  }

  componentWillReceiveProps(nextProps){
    let map = nextProps.map;

    if( map.mapData && typeof map.mapData === 'string' && map.mapData !== '{}' ){
      console.log('-- componentWillReceiveProps map : ', map.mapData);
      map.mapData = JSON.parse(map.mapData)
      // console.log('-------------------')
      // console.log('-- componentWillReceiveProps map1 : ', map.mapData);
      this.setState({
        map: map,
        isRefresh: true
      })
    } else if( map && map.mapSVG !== undefined && typeof map.mapData === 'string' && map.mapData === '{}' ){
      // console.log('-------------------')
      // console.log('-- componentWillReceiveProps map2 : ', map);
      this.setState({
        map: map,
        isRefresh: true
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isRefresh
  }
  /**************************  React Component Callback end ************************* */
  /********************************************************************************** */




  /********************************************************************************** */
  /********************************  Private Function  ****************************** */
  _addPlacesToSVG = () => {
    let {svg, map, curLevelIdx, curPlaceId} = this.state;
    if( svg && map && map.mapData && map.mapData.levels && map.mapData.levels.length > 0  ){
      let levels = map.mapData.levels;
      for( var i=0; i<levels.length; i++ ){
        let level = levels[i];
        let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];

        let places = level.places;
        if( places && places.length > 0 ){
          for( var j=0; j<places.length; j++ ){
            let place = places[j];
            let circle = document.createElement('circle');
            circle.setAttribute('cx', place.absX)
            circle.setAttribute('cy', place.absY)
            circle.setAttribute('r', PLACE_RADIUS)
            circle.setAttribute('stroke', 'rgba(255,170,0,0)')
            circle.setAttribute('stroke-width', 2)

            if( place.type == 'pathnode' ){
              if( place.id == curPlaceId )
                circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_SEL);
              else
                circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE);
            } else {
              if( place.id == curPlaceId )
                circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_SEL);
              else if( place.status )
                circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE);
              else
                circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_DISABLE);
            }

            let g = document.createElement('g');
            g.setAttribute('id', 'place_'+place.id);
            g.appendChild( circle );
            levelElem[0].parentNode.appendChild( g )

            // add line from place to direction
            let interactionPos = this._calcInteractionPos( level.id, place )

            if( interactionPos ){
              let finalPath = document.createElement('line');
              finalPath.setAttribute('x1', place.absX)
              finalPath.setAttribute('y1', place.absY)
              finalPath.setAttribute('x2', interactionPos.x)
              finalPath.setAttribute('y2', interactionPos.y)
              finalPath.setAttribute('style', 'stroke:' + FINALPATH_BACKGROUND_COLOR + ';stroke-width:' + FINALPATH_STROKE_WIDTH)

              let g = document.createElement('g');
              g.setAttribute('id', 'final_' + place.direction + '__' + place.id)
              g.appendChild( finalPath );

              let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id^=place_]')];
              if( placeElem[0] )
                levelElem[0].parentNode.insertBefore( g, placeElem[0] );
              else
                levelElem[0].parentNode.appendChild( g );
            }
          }
        }

        let directions = level.directions;
        if( directions && directions.length > 0 ){
          for( var j=0; j<directions.length; j++ ){
            let direction = directions[j];
            let placeA = this._getPlaceData(map, level.id, direction.placeA)
            let placeB = this._getPlaceData(map, level.id, direction.placeB)

            let line = document.createElement('line');
            line.setAttribute('x1', placeA.absX)
            line.setAttribute('y1', placeA.absY)
            line.setAttribute('x2', placeB.absX)
            line.setAttribute('y2', placeB.absY)
            let storkeColor = direction.status ? DIRECTION_BACKGROUND_COLOR_ENABLE : DIRECTION_BACKGROUND_COLOR_DISABLE;
            line.setAttribute('style', 'stroke:' + storkeColor + ';stroke-width:' + DIRECTION_STROKE_WIDTH)

            let g = document.createElement('g');
            g.setAttribute('id', 'direction_'+direction.id)
            g.appendChild( line );

            let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id^=place_]')];
            if( placeElem[0] )
              levelElem[0].parentNode.insertBefore( g, placeElem[0] );
            else
              levelElem[0].parentNode.appendChild( g );
          }
        }
      }
    }

    this._refreshMap();
  }


  _refreshMap = () => {
    let {svg, map, curLevelIdx, activePannel} = this.state;
    svg.innerHTML += "";

    if( map.mapData && map.mapData.levels && map.mapData.levels.length > 0 && map.mapData.levels[curLevelIdx] ){
      let places = map.mapData.levels[curLevelIdx].places;

      for( var i=0; i<places.length; i++ ){
        let place = places[i];
        let temp;
        if( place.fillId != '' ){
          temp = [...svg.querySelectorAll('g[id='+place.fillId+']')];
          if( temp[0] ){
            temp[0].addEventListener("mouseenter", this.onPlaceMouseEnter, false);
            temp[0].addEventListener("mouseleave", this.onPlaceMouseLeave.bind(this, place), false);
            temp[0].addEventListener("click", this.onPlaceMouseClick.bind(this, place), false);
          }
        }

        temp = [...svg.querySelectorAll('g[id=place_'+place.id+']')];
        if( temp[0] ){
          temp[0].addEventListener("mouseenter", this.onPlaceMouseEnter, false);
          temp[0].addEventListener("mouseleave", this.onPlaceMouseLeave.bind(this, place), false);
          temp[0].addEventListener("mousedown", this.onPlaceMouseDown.bind(this, place), false);
        }
      }


      let directions = map.mapData.levels[curLevelIdx].directions;

      for( var i=0; i<directions.length; i++ ){
        let direction = directions[i];
        let temp;

        temp = [...svg.querySelectorAll('g[id=direction_'+direction.id+']')];
        if( temp[0] ){
          temp[0].addEventListener("mouseenter", this.onDirectionMouseEnter, false);
          temp[0].addEventListener("mouseleave", this.onDirectionMouseLeave.bind(this, direction), false);
          temp[0].addEventListener("click", this.onDirectionMouseClick.bind(this, direction), false);
        }
      }
    }
  }



  _getPlaceData = (map, levelId, placeId) => {
    let mapData = map.mapData;
    if( mapData && mapData.levels && mapData.levels.length > 0 ){
      for( var i=0; i<mapData.levels.length; i++ ){
        let level = mapData.levels[i];
        if( level.id !== levelId ) continue;
        if( level && level.places && level.places.length > 0 ){
          for( var j=0; j<level.places.length; j++ ){
            let place = level.places[j];
            if( place.id !== placeId ) continue;
            return place;
          }
        }
      }
    }

    return null;
  }


  _getDirectionData = (map, levelId, directionId) => {
    let mapData = map.mapData;
    if( mapData && mapData.levels && mapData.levels.length > 0 ){
      for( var i=0; i<mapData.levels.length; i++ ){
        let level = mapData.levels[i];
        if( level.id !== levelId ) continue;
        if( level && level.directions && level.directions.length > 0 ){
          for( var j=0; j<level.directions.length; j++ ){
            let direction = level.directions[j];
            if( direction.id !== directionId ) continue;
            return direction;
          }
        }
      }
    }

    return null;
  }
  /******************************  Private Function end ***************************** */
  /********************************************************************************** */




  /********************************************************************************** */
  /*******************************  Component Callback  ***************************** */
  loadSVG = (svg) => {
    let {map} = this.state;
    console.log('-- svg : ', svg);
    const levelElems = [...svg.querySelectorAll('g[id^=level]')]
    // console.log('-- levelElems : ', levelElems);

    let levelElemCount = 0
    for( let i=0; i<levelElems.length; i++ ){
      let levelElem = levelElems[i];
      let levelId = levelElem.id;
      if( levelId.indexOf('_') > -1 ) continue
      levelElemCount++;
    }

    let levels = [];
    let levelCount = 0
    for( let i=0; i<levelElemCount; i++ ){
      let levelElem = [...svg.querySelectorAll('g[id=level'+i+']')];
      console.log('-- levelElem : ', levelElem)
      levelElem = levelElem[0];
      let levelId = levelElem.id;

      // Move to valid area. This is because map is in left-top corner when loading time.
      // So, we need to move it to center position of screen. [540, 200]
      let matrix = levelElem.parentNode.transform.baseVal[0].matrix;
      matrix = matrix.translate( this.props.offset.x, this.props.offset.y );
      levelElem.parentNode.transform.baseVal[0].setMatrix( matrix );

      let placesData = [];
      if( map.mapData && map.mapData.levels && map.mapData.levels[i] && map.mapData.levels[i].places ){
        levels = map.mapData.levels
      } else {
        // Get Places
        let mapElem = levelElem.children[0];
        let places = [...mapElem.querySelectorAll('g[id^=d_]')]
        console.log('-- mapElem : ', mapElem);
        console.log('-- places : ', places);


        for( var placeIdx=0; placeIdx<places.length; placeIdx++ ){
          let placeElem = places[placeIdx];
          let temp = [...placeElem.querySelectorAll('use')]
          if( temp[0] ){
            let fillId = temp[0].href.baseVal.replace('#', '');
            temp = [...svg.querySelectorAll('g[id='+fillId+']')];
            // console.log('-- temp : ', temp, fillId)

            let placeData = this._getPlaceData(map, levelElem.id, placeElem.id);
            if( placeData ){

            } else {
              let dStr = temp[0].children[0].getAttribute('d');
              dStr = dStr.toUpperCase();
              // console.log('-- temp[0].children[0] : ', dStr);
              let dStrArr = dStr.split(' ');
              let symbolArr = ['M', 'Z', 'L', 'H', 'V', 'C', 'S', 'Q', 'T', 'A'];

              // console.log('-- dStrArr 1 : ', dStrArr);
              dStrArr = dStrArr.filter( (elem) => {
                if( symbolArr.includes(elem.toUpperCase()) || elem == '' ) return false
                else return true
              })
              // console.log('-- dStrArr 2 : ', dStrArr);

              let minX = 100000, maxX=-100000;
              let minY = 100000, maxY=-100000;
              if( dStrArr.length > 3 ){
                let offsetX = 0, offsetY = 0;
                let count = 0;
                for( var j=0; j<dStrArr.length-2; j=j+2 ){
                  minX = parseFloat(dStrArr[j]) < minX ? parseFloat(dStrArr[j]) : minX;
                  maxX = parseFloat(dStrArr[j]) > maxX ? parseFloat(dStrArr[j]) : maxX;
                  minY = parseFloat(dStrArr[j+1]) < minY ? parseFloat(dStrArr[j+1]) : minY;
                  maxY = parseFloat(dStrArr[j+1]) > maxY ? parseFloat(dStrArr[j+1]) : maxY;
                }


              }
              let x = (minX+maxX)/2
              let y = (minY+maxY)/2
              // console.log('-- x&y : ', x,y);

              let matrixArr = [];
              matrixArr.push( placeElem.children[0].transform.baseVal[0].matrix );
              matrixArr.push( placeElem.transform.baseVal[0].matrix );

              let parentElem = placeElem.parentNode;
              let elemId = parentElem.id;
              let count = 0;
              while( true ) {
                if( parentElem.transform && parentElem.transform.baseVal[0] ){
                  matrixArr.push( parentElem.transform.baseVal[0].matrix );
                }

                if( elemId.indexOf('map') == 0 ) break;
                if( count > 3 ) break;

                parentElem = parentElem.parentNode;
                elemId = parentElem.id;
                count++;
              }
              let levelMatrix = levelElem.transform.baseVal[0].matrix;
              matrixArr.push(levelMatrix);

              let finalMatrix = svg.createSVGMatrix();
              for( var k=matrixArr.length-1; k>=0; k-- ){
                finalMatrix = finalMatrix.multiply(matrixArr[k]);
              }

              let absX = finalMatrix.a*x + finalMatrix.c*y + finalMatrix.e
              let absY = finalMatrix.b*x + finalMatrix.d*y + finalMatrix.f

              placeData = {
                id: placeElem.id,
                levelId: levelId,
                fillId: fillId,
                name: '',
                x: parseInt(x*1000)/1000,
                y: parseInt(y*1000)/1000,
                absX: parseInt(absX*1000)/1000,
                absY: parseInt(absY*1000)/1000,
                type: 'place',
                direction: '',
                status: false
              };
            }
            placesData.push(placeData);
          }
        }

        // get Level Info
        levels.push( {
          id: levelElem.id,
          name: levelElem.id,
          mapId: mapElem.id,
          places: placesData,
          directions: [],
          pathNodes: []
        } );
      }

      // if level is not first level, hide level elem.
      if( levelCount !== this.state.curLevelIdx )
        levelElem.parentNode.setAttribute('visibility', 'hidden');

      levelCount++;
    }

    if( typeof map.mapData === 'string' )
      map.mapData = JSON.parse( map.mapData );
    map.mapData.levels = levels;

    let that = this;
    setTimeout(function() {
      that._addPlacesToSVG( map );
    }, 100);

    this.setState({
      map: map,
      curLevelIdx: 0,
      svg: svg,
      mapOffset: this.props.offset,
      mapZoom: 1,
      isRefresh: true
    })
  }

  onSelectLevel = (levelIdx) => {
    let {svg, map} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    if( svg === null || levels.length === 0 ) return;

    for( let i=0; i<levels.length; i++ ){
      let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
      if( levelElem.length > 0 ){
        levelElem = levelElem[0];
        // console.log('-- levelElem: ', levelElem)
        if( i === levelIdx ) {
          levelElem.setAttribute('visibility', 'visible');
          levelElem.parentNode.setAttribute('visibility', 'visible');
        } else {
          levelElem.setAttribute('visibility', 'hidden')
          levelElem.parentNode.setAttribute('visibility', 'hidden');
        }
      }
    }

    this.setState({
      curLevelIdx: levelIdx,
      activePannel: 'places',
      isRefresh: true
    })

    let that = this
    setTimeout(function(){that._refreshMap()}, 10);
  }

  onSaveMapData = () => {
    let {map} = this.state;
    console.log('-- onSaveMapData map : ', map)
    this.props.updateMap(map)
  }

  onSelectPannel = (selectPannel) => {
    console.log('-- selectPannel : ', selectPannel);
    this.setState({
      activePannel: selectPannel,
      isRefresh: false
    })
  }
  /*****************************  Component Callback end **************************** */
  /********************************************************************************** */




  /********************************************************************************** */
  /*****************************  Map Drag & Zoom start  **************************** */
  onMapWheel = (e) => {
    // console.log('-- onMapWheel e : ', e, e.deltaMode, e.deltaX, e.deltaY, e.deltaZ);

    let {mapZoom} = this.state;
    mapZoom -= e.deltaY/500;
    if( mapZoom > 0 && mapZoom <= 5 ) {
      this.mapZoom( mapZoom );
    }
  }


  onMapDrag = (e) => {
    console.log('-- onMapDrag')
    let {mapDragStart, mapOffset, dragStart, placeDragStart, placeDragEnd, svg, map, curLevelIdx, curPlaceId} = this.state;
    let curTime = Date.now();
    let offsetX = 0, offsetY = 0, offsetX1 = e.nativeEvent.movementX, offsetY1 = e.nativeEvent.movementY;
    // console.log('-- dragTime : ', curTime, dragStart, curTime-dragStart)

    if( mapDragStart && curTime-dragStart > 200 ){
      // console.log('-- onMapDrag e : ', e.nativeEvent.movementX, e.nativeEvent.movementY);
      mapOffset.x += e.nativeEvent.movementX;
      mapOffset.y += e.nativeEvent.movementY;
      this.mapDrag( mapOffset );
      return;
    }

    if( placeDragStart && curTime-dragStart > 200 ){
      let level = map.mapData.levels[curLevelIdx];
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let matrix = levelElem[0].parentNode.transform.baseVal[0].matrix;
      let newMatrix = matrix.inverse();
      // console.log(
      //   '-- placeDrag matrix : ',
      //   [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f],
      //   [newMatrix.a, newMatrix.b, newMatrix.c, newMatrix.d, newMatrix.e, newMatrix.f],
      // );
      offsetX = offsetX1/matrix.a
      offsetY = offsetY1/matrix.d
      // console.log('-- placeDrag e : ', offsetX, offsetY, offsetX1, offsetY1);

      let place = this._getPlaceData(map, level.id, curPlaceId);
      if( place ){
        place.absX = place.absX+offsetX;
        place.absY = place.absY+offsetY;

        let temp = [...svg.querySelectorAll('g[id=place_'+curPlaceId+']')];

        if( temp[0] ){
          temp[0].children[0].setAttribute('cx', place.absX);
          temp[0].children[0].setAttribute('cy', place.absY);

          if( place.direction != '' && place.direction != undefined ){
            let finalpathElem = [...svg.querySelectorAll('g[id^=final_'+place.direction+'__'+place.id+']')];
            let interactionPos = this._calcInteractionPos( level.id, place )
            if( interactionPos ){
              finalpathElem[0].children[0].setAttribute('x1', place.absX)
              finalpathElem[0].children[0].setAttribute('y1', place.absY)
              finalpathElem[0].children[0].setAttribute('x2', interactionPos.x)
              finalpathElem[0].children[0].setAttribute('y2', interactionPos.y)
            }
          }
        }

        let directions = level.directions;
        console.log('-- directions : ', directions, place.id);
        for( var i=0; i<directions.length; i++ ){
          let isMoved = false
          if( directions[i].placeA == place.id ){
            let directionElem = [...svg.querySelectorAll('g[id=direction_'+directions[i].id+']')];
            if( directionElem[0] ){
              isMoved = true;
              directionElem[0].children[0].setAttribute('x1', place.absX);
              directionElem[0].children[0].setAttribute('y1', place.absY);
            }
          }
          if( directions[i].placeB == place.id ){
            let directionElem = [...svg.querySelectorAll('g[id=direction_'+directions[i].id+']')];
            if( directionElem[0] ){
              isMoved = true;
              directionElem[0].children[0].setAttribute('x2', place.absX);
              directionElem[0].children[0].setAttribute('y2', place.absY);
            }
          }

          if( isMoved ){
            let finalpathElems = [...svg.querySelectorAll('g[id^=final_'+directions[i].id+']')];
            for( var j=0; j<finalpathElems.length; j++ ){
              let finalpathElem = finalpathElems[j];
              let linkedPlaceId = finalpathElem.id;
              linkedPlaceId = linkedPlaceId.replace('final_' + directions[i].id + '__', '');
              console.log('-- linkedPlaceId : ', linkedPlaceId);
              let linkedPlace = this._getPlaceData( map, level.id, linkedPlaceId )

              let interactionPos = this._calcInteractionPos( level.id, linkedPlace )
              if( interactionPos ){
                finalpathElem.children[0].setAttribute('x2', interactionPos.x)
                finalpathElem.children[0].setAttribute('y2', interactionPos.y)
              }
            }
          }
        }
        this.setState({
          map: map,
          isPlaceDragged: true,
          isRefresh: false
        })
      }
    }
  }


  onMapDragStart = (e) => {
    console.log('-- onMapDragStart')
    if( this.state.placeDragStart ) return;

    this.setState({
      mapDragStart: true,
      dragStart: Date.now(),
      isRefresh: false
    })
  }


  onMapLeave = (e) => {
    console.log('-- onMapLeave : start');
    this.setState({
      mapDragStart: false,
      placeDragStart: false,
      dragStart: NaN,
      isRefresh: false
    })
  }


  onMapClick = (e) => {
    let {isPickLocation, isDrawingPath, mapDragStart, placeDragStart, isMapDragged, isPlaceDragged, svg, map, curLevelIdx, curPlaceId} = this.state;
    console.log('-- onMapClick isMapDragged : ', isMapDragged);

    // When add place, if user click any location on map
    if( isMapDragged == false && isPlaceDragged == false && placeDragStart == false && isPickLocation == true ){
      let level = map.mapData.levels[curLevelIdx];
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let matrix = levelElem[0].parentNode.transform.baseVal[0].matrix;
      let newMatrix = matrix.inverse();

      let {offsetX, offsetY} = e.nativeEvent
      let newX = newMatrix.a*offsetX + newMatrix.c*offsetY + newMatrix.e
      let newY = newMatrix.b*offsetX + newMatrix.d*offsetY + newMatrix.f
      console.log('-- onMapClick oldPos : ', offsetX, offsetY);
      console.log('-- onMapClick newPos : ', newX, newY);

      this.setState({
        isPickLocation: false,
        addPlaceX: newX,
        addPlaceY: newY,
        mapDragStart: false,
        placeDragStart: false,
        isMapDragged: false,
        isPlaceDragged: false,
        dragStart: NaN,
        curPlaceId: '',
        curDirectionId: '',
        isRefresh: true,
      })

      return;
    }

    let isRefresh = false;
    let prevPathNode = null;
    console.log('--** : ', isMapDragged, isPlaceDragged, placeDragStart, isDrawingPath)
    if( isMapDragged == false && isPlaceDragged == false && placeDragStart == false && isDrawingPath == true ){
      // when making link path, if user click any location on map
      let level = map.mapData.levels[curLevelIdx];
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let matrix = levelElem[0].parentNode.transform.baseVal[0].matrix;
      let newMatrix = matrix.inverse();

      let {offsetX, offsetY} = e.nativeEvent
      let newX = newMatrix.a*offsetX + newMatrix.c*offsetY + newMatrix.e
      let newY = newMatrix.b*offsetX + newMatrix.d*offsetY + newMatrix.f
      console.log('-- onMapClick oldPos : ', offsetX, offsetY);
      console.log('-- onMapClick newPos : ', newX, newY);
      console.log('-- onMapClick placeDragStart : ', this.state.placeDragStart);

      let curTime = new Date();
      prevPathNode = {
        id: 'p_' + curTime.getTime(),
        levelId: level.id,
        fillId: '',
        name: '',
        x: 0,
        y: 0,
        absX: newX,
        absY: newY,
        type: 'pathnode',
        status: true
      }

      this.onAddPlace( prevPathNode )
      if( this.state.prevPathNode )
        this.onAddDirection( this.state.prevPathNode, prevPathNode )

      isRefresh = true;
    } else if( isMapDragged == false && isPlaceDragged == false && placeDragStart == true && isDrawingPath == true ) {
      // when making link path, if user click path node
      console.log('--** place is clicked : ', this.state.prevPathNode, curPlaceId)
      if( this.state.prevPathNode == null ){
        prevPathNode = this._getPlaceData( map, map.mapData.levels[curLevelIdx].id, curPlaceId );
        console.log('--** prevPathNode : ', prevPathNode);
        if( prevPathNode.type != 'pathnode' ) prevPathNode = null
      } else if( this.state.prevPathNode.id != curPlaceId ){
        console.log('--** curPlaceId : ', curPlaceId, map.mapData.levels[curLevelIdx].places);
        prevPathNode = this._getPlaceData( map, map.mapData.levels[curLevelIdx].id, curPlaceId );
        if( prevPathNode.type != 'pathnode' ) prevPathNode = null;
        if( prevPathNode != null ){
          console.log('--** prevPathNode : ', prevPathNode, map, curLevelIdx, curPlaceId);
          this.onAddDirection( this.state.prevPathNode, prevPathNode )
        }
      }
    }

    if( prevPathNode ){
      this.setState({
        mapDragStart: false,
        placeDragStart: false,
        isMapDragged: false,
        isPlaceDragged: false,
        dragStart: NaN,
        isRefresh: isRefresh,
        prevPathNode: prevPathNode,
      })
    } else {
      this.setState({
        mapDragStart: false,
        placeDragStart: false,
        isMapDragged: false,
        isPlaceDragged: false,
        dragStart: NaN,
        isRefresh: isRefresh,
      })
    }


  }


  mapZoom = (mapZoom) => {
    let {svg, map, mapOffset} = this.state;

    let levels = [];

    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    if( svg === null || levels.length === 0 ) return;

    let matrix = svg.createSVGMatrix();
    matrix = matrix.scale( mapZoom );
    matrix = matrix.translate( mapOffset.x, mapOffset.y )

    for( let i=0; i<levels.length; i++ ){
      let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
      if( levelElem.length > 0 ){
        levelElem = levelElem[0];
        levelElem.parentNode.transform.baseVal[0].setMatrix( matrix )
      }
    }

    this.setState({
      mapZoom: mapZoom,
      isRefresh: false
    })
  }


  mapDrag = (mapOffset) => {
    console.log('-- mapDrag --')
    let {svg, map, mapZoom} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    if( svg === null || levels.length === 0 ) return;

    let matrix = svg.createSVGMatrix();
    matrix = matrix.scale( mapZoom );
    matrix = matrix.translate( mapOffset.x, mapOffset.y )

    for( let i=0; i<levels.length; i++ ){
      let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
      if( levelElem.length > 0 ){
        levelElem = levelElem[0];
        levelElem.parentNode.transform.baseVal[0].setMatrix( matrix )
      }
    }

    this.setState({
      mapOffset: mapOffset,
      isMapDragged: true,
      isRefresh: false
    })
  }
  /******************************  Map Drag & Zoom End  ***************************** */
  /********************************************************************************** */




  /********************************************************************************** */
  /***************************  Places Mouse Event on Map  ************************** */
  onPlaceMouseEnter = (event) => {
    // console.log('-- onPlaceMouseEnter : ', event.target, event.target.id, event.target.children[0]);
    let {svg, map, curLevelIdx} = this.state;

    let isCircle = false;
    let targetId = event.target.id;
    if( targetId.indexOf( 'place_' ) === 0 ) isCircle = true;

    let temp = [...svg.querySelectorAll('g[id='+event.target.id+']')];
    if( isCircle ){
      if( targetId.indexOf( 'place_d_' ) === 0 )
        temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_HOVER);
      else if( targetId.indexOf( 'place_p_' ) === 0 )
        temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_HOVER);
    } else {
      temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR_HOVER);
    }

    temp[0].removeEventListener('mouseenter', this.onPlaceMouseEnter, false)
  }

  onPlaceMouseLeave = (place, event) => {

    let {svg, map, curLevelIdx, curPlaceId} = this.state;
    let levels = map.mapData.levels;
    if( levels == undefined ) return;
    let curLevel = levels[curLevelIdx];
    place = this._getPlaceData(map, curLevel.id, place.id);

    let isCircle = false;
    let targetId = event.target.id;
    if( targetId.indexOf( 'place_' ) === 0 ) isCircle = true;

    if( isCircle ){
      let temp = [...svg.querySelectorAll('g[id=place_'+place.id+']')];
      if( place.type == 'pathnode' ){
        if( place.id == curPlaceId )
          temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_SEL);
        else
          temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE);
      } else {
        if( place.id == curPlaceId )
          temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_SEL);
        else if( place.status )
          temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE);
        else
          temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_DISABLE);
      }

      temp[0].addEventListener('mouseenter', this.onPlaceMouseEnter, false)
    } else {
      if( place.fillId != '' ){
        let temp = [...svg.querySelectorAll('g[id='+place.fillId+']')];
        if( place.name !== '' ){
          temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR_SETTED);
        } else {
          temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR);
        }

        if( place.id === curPlaceId ){
          temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR_SEL);
        }
        temp[0].addEventListener('mouseenter', this.onPlaceMouseEnter, false)
      }
    }

  }

  onPlaceMouseClick = (place, event) => {
    let isRefresh = true;
    if( this.state.isDrawingPath == true ) isRefresh = false;

    console.log('-- onPlaceMouseClick');
    this.setState({
      curPlaceId: place.id,
      curDirectionId: '',
      isRefresh: isRefresh
    })
  }

  onPlaceMouseDown = async (place, event) => {
    let isRefresh = true;
    if( this.state.isDrawingPath == true ) isRefresh = false;

    console.log('-- onPlaceMouseDown');
    this.setState({
      placeDragStart: true,
      dragStart: Date.now(),
      curPlaceId: place.id,
      curDirectionId: '',
      isRefresh: isRefresh
    })
  }
  /*************************  Places Mouse Event on Map End  ************************ */
  /********************************************************************************** */


  /********************************************************************************** */
  /*************************  Directions Mouse Event on Map  ************************ */
  onDirectionMouseEnter = (event) => {
    // console.log('-- onDirectionMouseEnter : ', event.target, event.target.id, event.target.children[0]);
    let {svg, map, curLevelIdx} = this.state;
    let temp = [...svg.querySelectorAll('g[id='+event.target.id+']')];
    if( temp[0] ) {
      temp[0].children[0].setAttribute('style', 'stroke:' + DIRECTION_BACKGROUND_COLOR_HOVER + ';stroke-width:' + DIRECTION_STROKE_WIDTH);
      temp[0].removeEventListener('mouseenter', this.onDirectionMouseEnter, false)
    }
  }

  onDirectionMouseLeave = (direction, event) => {

    let {svg, map, curLevelIdx, curDirectionId} = this.state;

    let temp = [...svg.querySelectorAll('g[id=direction_'+direction.id+']')];
    if( temp[0] ){
      if( direction.id == curDirectionId )
        temp[0].children[0].setAttribute('style', 'stroke:' + DIRECTION_BACKGROUND_COLOR_SEL + ';stroke-width:' + DIRECTION_STROKE_WIDTH);
      else {
        let storkeColor = direction.status ? DIRECTION_BACKGROUND_COLOR_ENABLE : DIRECTION_BACKGROUND_COLOR_DISABLE;
        temp[0].children[0].setAttribute('style', 'stroke:' + storkeColor + ';stroke-width:' + DIRECTION_STROKE_WIDTH);
      }

      temp[0].addEventListener('mouseenter', this.onDirectionMouseEnter, false)
    }
  }

  onDirectionMouseClick = (direction, event) => {
    console.log('-- onDirectionMouseClick');
    let {isPickDirection, map, curLevelIdx, pickPlace} = this.state;

    if( isPickDirection ){
      let places = map.mapData.levels[curLevelIdx].places;
      for( var i=0; i<places.length; i++ ){
        if( places[i].id == pickPlace.id ){
          places[i].direction = direction.id;

          this._renderFinalPath(places[i]);
          this._refreshMap()
          break;
        }
      }
      this.setState({
        isPickDirection: false,
        map: map,
        isRefresh: true
      })
    } else {
      this.setState({
        curDirectionId: direction.id,
        curPlaceId: '',
        isRefresh: true
      })
    }

  }
  /*************************  Places Mouse Event on Map End  ************************ */
  /********************************************************************************** */



  /********************************************************************************** */
  /************************  MapEditorPlacesPannel Callbacks Start  *********************** */
  onPlaceClick = (placeId) => {
    this.setState({
      curPlaceId: placeId,
      curDirectionId: '',
      isRefresh: true
    })
  }

  onPlaceName = (place, name) => {
    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].name = name;
        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }

  onPlaceType = (place, type) => {
    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places;
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].type = type;
        if(type === 'stair'){
          places[j].isWheelchair = false;
          places[j].stairDist = STAIR_DIST;
        }else if(type === 'elevator'){
          places[j].isWheelchair = true;
        }else if(type === 'escalator'){
          places[j].isWheelchair = false;
        }else {
          places[j].isWheelchair = true;
        }

        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }

  onPlaceSubType = (place, type) => {
    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places;
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].subType = type;
        // places[j].name = type.charAt(0).toUpperCase() + type.slice(1)

        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }


  onPlaceConnection = (place, connectionId) => {

    console.log('MapEditor onPlaceConnection: ',place,connectionId)
    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places;
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].connection = connectionId;

        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }

  onConnectionTime = (place, time) => {
    let newtime = parseFloat(time);
    console.log('onConnectionTime time', newtime);


    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places;
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].time = newtime;

        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }

  onStairDistChange = (place,dist) => {
    let stairDist = parseFloat(dist);
    console.log('onStairDistChange time', stairDist);


    let {map, curLevelIdx} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels ) levels = map.mapData.levels;
    let level = levels[curLevelIdx];

    if( level && level.places && level.places.length ){
      let places = level.places;
      for( var j=0; j<places.length; j++ ){
        if( places[j].id !== place.id ) continue;

        places[j].stairDist = stairDist;

        this.setState({
          map: map,
          isRefresh: true
        })
        return;
      }
    }
  }

  onAmenityGroupByCheckChange = (place, status) => {
    console.log('-- onAmenityGroupByCheckChange place : ', place);

    let {svg, map, curLevelIdx} = this.state;
    let level = map.mapData.levels[curLevelIdx]
    let places = level.places;

    for( var i=0; i<places.length; i++ ){
      if( places[i].id == place.id ){
        places[i].groupBy = status
        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      that._refreshMap()
    }, 10);
  }



  onWheelchairCheckChange = (place, status) => {
    console.log('-- onWheelchairCheckChange place : ', place);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let places = level.places;

    for( var i=0; i<places.length; i++ ){
      if( places[i].id == place.id ){
        places[i].isWheelchair = status
        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      that._refreshMap()
    }, 10);
  }


  onPickLocation = (isPickLocation) => {
    this.setState({
      isPickLocation: isPickLocation,
      addPlaceX: 0,
      addPlaceY: 0,
      isRefresh: false
    })
  }


  onPlaceStatus = (place, status) => {
    console.log('-- onPlaceStatus place : ', place);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let places = level.places;

    for( var i=0; i<places.length; i++ ){
      if( places[i].id == place.id ){
        places[i].status = status
        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      that._refreshMap()
    }, 10);
  }


  onAddPlace = (place) => {
    console.log('-- onAddPlace place : ', place);

    if(REAL_CONNECTIONS_TYPES.includes(place.type)){
      let time = place.time;
      place.time = parseFloat(time);
      console.log('the real connection',place)
      if(place.connection === undefined){
          let over_exit = place;
          let nextLevel =  curLevelIdx + 1;
          over_exit.levelId = 'level' + nextLevel;


      }
    }

    let {svg, map, curLevelIdx, curPlaceId} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let places = level.places;
    places.push( place );
    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let circle = document.createElement('circle');
      circle.setAttribute('cx', place.absX)
      circle.setAttribute('cy', place.absY)
      circle.setAttribute('r', PLACE_RADIUS)
      circle.setAttribute('stroke', 'rgba(255,170,0,0)')
      circle.setAttribute('stroke-width', 2)

      if( place.type == 'pathnode' ){
        if( place.id == curPlaceId )
          circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_SEL);
        else
          circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE);
      } else {
        if( place.id == curPlaceId )
          circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_SEL);
        else if( place.status )
          circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE);
        else
          circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_DISABLE);
      }


      // console.log('-- circle : ', circle)

      let g = document.createElement('g');
      g.setAttribute('id', 'place_'+place.id)
      g.appendChild( circle );
      levelElem[0].parentNode.appendChild( g )

      that._refreshMap()
    }, 10);
  }

  onDeletePlace = (place) => {
    console.log('-- onDeletePlace place : ', place);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let places = level.places;
    let directions = level.directions;
    let delDirectionIds = [];

    for( var i=0; i<places.length; i++ ){
      if( places[i].id == place.id ){

        if( place.type == 'pathnode' ){
          for( var j=0; j<directions.length; j++){
            if(directions[j].placeA == place.id || directions[j].placeB == place.id ){
              delDirectionIds.push(directions[j].id)
              directions.splice(j, 1);
              j--;
            }
          }
        }
        places.splice(i, 1);

        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let placeElem = [...svg.querySelectorAll('g[id=place_'+place.id+']')];
      levelElem[0].parentNode.removeChild( placeElem[0] );

      for( var i=0; i<delDirectionIds.length; i++ ){
        let directionElem = [...svg.querySelectorAll('g[id=direction_'+delDirectionIds[i]+']')];
        console.log('-- directionElem : ', directionElem, delDirectionIds, svg)
        levelElem[0].parentNode.removeChild( directionElem[0] );
      }
      that._refreshMap()
    }, 10);
  }


  onDrawingPath = (isDrawingPath) => {
    console.log('-- isDrawingPath : ', isDrawingPath)
    this.setState({
      isDrawingPath: isDrawingPath,
      prevPathNode: null,
      isRefresh: false
    })
  }


  onAddDirection = (placeA, placeB) => {
    console.log('-- onAddDirection place : ', placeA, placeB);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let directions = level.directions;
    let directionId = new Date();
    directionId = 'l_' + directionId.getTime();
    directions.push( {
      id: directionId,
      placeA: placeA.id,
      placeB: placeB.id,
      status: true,
      isWheelchair: true,
      role: 'all'
    } );

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let line = document.createElement('line');
      line.setAttribute('x1', placeA.absX)
      line.setAttribute('y1', placeA.absY)
      line.setAttribute('x2', placeB.absX)
      line.setAttribute('y2', placeB.absY)
      line.setAttribute('style', 'stroke:' + DIRECTION_BACKGROUND_COLOR_ENABLE + ';stroke-width:' + DIRECTION_STROKE_WIDTH)

      let g = document.createElement('g');
      g.setAttribute('id', 'direction_'+directionId)
      g.appendChild( line );

      let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id^=place_]')];
      if( placeElem[0] )
        levelElem[0].parentNode.insertBefore( g, placeElem[0] );
      else
        levelElem[0].parentNode.appendChild( g );

      that._refreshMap()
    }, 10);
  }
  /*************************  MapEditorPlacesPannel Callbacks End  ************************ */
  /********************************************************************************** */



  /********************************************************************************** */
  /****************************  MapEditorDirectionsPannel Callbacks  *************************** */
  onDirectionClick = (directionId) => {
    console.log('-- directionId : ', directionId);
    this.setState({
      curDirectionId: directionId,
      curPlaceId: '',
      isRefresh: true
    })
  }

  onDirectionStatus = (direction, status) => {
    console.log('-- onDirectionStatus direction : ', direction);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let directions = level.directions;

    for( var i=0; i<directions.length; i++ ){
      if( directions[i].id == direction.id ){
        directions[i].status = status
        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      that._refreshMap()
    }, 10);
  }


  onDeleteDirection = (direction) => {
    console.log('-- onDeleteDirection direction : ', direction);
    let {svg, map, curLevelIdx} = this.state;

    let level = map.mapData.levels[curLevelIdx]
    let directions = level.directions;

    for( var i=0; i<directions.length; i++ ){
      if( directions[i].id == direction.id ){
        directions.splice(i, 1);
        break;
      }
    }

    this.setState({
      map: map,
      isRefresh: true
    })

    let that = this;
    setTimeout(function(){
      let levelElem = [...svg.querySelectorAll('g[id='+level.id+']')];
      let directionElem = [...svg.querySelectorAll('g[id=direction_'+direction.id+']')];
      levelElem[0].parentNode.removeChild( directionElem[0] );
      that._refreshMap()
    }, 10);
  }


  onPickDirection = (place, isPickDirection) => {
    this.setState({
      isPickDirection: isPickDirection,
      pickPlace: place,
      isRefresh: false
    })
  }
  /*************************  MapEditorDirectionsPannel Callbacks End  ************************ */
  /********************************************************************************** */




  _renderPlacesColor = () => {
    let {svg, curPlaceId, curDirectionId, map, curLevelIdx, isRefresh} = this.state;
    if( !isRefresh ) return;
    console.log('+++++++++++++++++++++++++')

    if( svg && map.mapData && typeof map.mapData !== 'string' && map.mapData.levels ){
      let levels = map.mapData.levels
      let curLevel = levels[curLevelIdx];
      let curPlace = this._getPlaceData(map, curLevel.id, curPlaceId);

      for( var i=0; i<curLevel.places.length; i++ ){
        var place = curLevel.places[i];

        // set fill color of place area
        if( place.fillId != '' ){
          if( place.name !== '' ){
            let temp = [...svg.querySelectorAll('g[id='+place.fillId+']')];
            temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR_SETTED);
          } else {
            let temp = [...svg.querySelectorAll('g[id='+place.fillId+']')];
            temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR);
          }

          if( place.id === curPlaceId ){
            let temp = [...svg.querySelectorAll('g[id='+place.fillId+']')];
            temp[0].children[0].setAttribute('fill', PLACES_BACKGROUND_COLOR_SEL);
          }
        }

        // set fill color of place circle
        let temp = [...svg.querySelectorAll('g[id=place_'+place.id+']')];
        if( temp[0] ){
          // pathnode circle's fill color
          if( place.type == 'pathnode' ){
            if( place.id == curPlaceId )
              temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE_SEL);
            else
              temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_PATHNODE);

          // selected place circle's fill color
          } else {
            if( place.id == curPlaceId )
              temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_SEL);
            else if( place.status )
              temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE);
            else
              temp[0].children[0].setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_DISABLE);
          }
        }


      }

      // set Direction's color
      for( var i=0; i<curLevel.directions.length; i++ ){
        var direction = curLevel.directions[i];

        let temp = [...svg.querySelectorAll('g[id=direction_'+direction.id+']')];
        if( temp[0] ){
          if( direction.id == curDirectionId ){
            temp[0].children[0].setAttribute('style', 'stroke:' + DIRECTION_BACKGROUND_COLOR_SEL + ';stroke-width:' + DIRECTION_STROKE_WIDTH)
          } else {
            let storkeColor = direction.status ? DIRECTION_BACKGROUND_COLOR_ENABLE : DIRECTION_BACKGROUND_COLOR_DISABLE;
            temp[0].children[0].setAttribute('style', 'stroke:' + storkeColor + ';stroke-width:' + DIRECTION_STROKE_WIDTH)
          }
        }
      }
    }
  }


  _calcInteractionPos( levelId, place ){
    let {map, curLevelIdx} = this.state;
    if( place.direction == '' || place.direction == undefined ) return null;

    let direction = this._getDirectionData( map, levelId, place.direction )
    if(direction == null){
      console.log('_calcInteractionPos: the direction is null');
      return null;
    }
    console.log('-- direction : ', direction, map, levelId, place)
    let placeA = this._getPlaceData( map, levelId, direction.placeA )
    let placeB = this._getPlaceData( map, levelId, direction.placeB )

    let x1 = placeA.absX, y1 = placeA.absY
    let x2 = placeB.absX, y2 = placeB.absY
    let x3 = place.absX, y3 = place.absY
    let dX = x2-x1, dY = y2-y1
    let m = dY/dX

    let x4 = ( y3 - y1 + m*x1 + 1/m*x3 ) / (m + 1/m)
    let y4 = m * (x4-x1) + y1

    return {x: x4, y: y4}

  }

  _renderFinalPath(place) {
    let {svg, map, curLevelIdx, curPlaceId} = this.state;
    if( place.direction == '' || place.direction == undefined ) return null;

    let levels = map.mapData.levels
    let curLevel = levels[curLevelIdx];
    let direction = this._getDirectionData( map, curLevel.id, place.direction )
    let levelElem = [...svg.querySelectorAll('g[id='+curLevel.id+']')];
    let interactionPos = this._calcInteractionPos( curLevel.id, place )
    console.log('-- interactionPos : ', interactionPos);

    if( interactionPos ){
      let finalPath = document.createElement('line');
      finalPath.setAttribute('x1', place.absX)
      finalPath.setAttribute('y1', place.absY)
      finalPath.setAttribute('x2', interactionPos.x)
      finalPath.setAttribute('y2', interactionPos.y)
      finalPath.setAttribute('style', 'stroke:' + FINALPATH_BACKGROUND_COLOR + ';stroke-width:' + FINALPATH_STROKE_WIDTH)

      let g = document.createElement('g');
      g.setAttribute('id', 'final_' + place.direction + '__' + place.id)
      g.appendChild( finalPath );

      let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id^=place_]')];
      if( placeElem[0] )
        levelElem[0].parentNode.insertBefore( g, placeElem[0] );
      else
        levelElem[0].parentNode.appendChild( g );
    }
  }

  render() {
    let {curLevelIdx, curPlaceId, curDirectionId, map, activePannel, addPlaceX, addPlaceY, isPickDirection, isPickLocation, isMapDragged, isPlaceDragged} = this.state;
    let levels = [];
    if( map.mapData && map.mapData.levels) levels = map.mapData.levels;
    let levelsArr = [];
    console.log('-- render start : ');

    for( let i=0; i<levels.length; i++ ){
      let level = levels[i];
      levelsArr.push(
        <a
          style={{
            ...styles.levelBtn,
            backgroundColor: curLevelIdx===i ? '#333' : '#fff',
            color: curLevelIdx===i ? '#fff' : '#333',
          }}
          onClick={this.onSelectLevel.bind(this, i)}
          className="levelBtn"
          key={'levelbtn-' + level.id}
        >
          {level.name}
        </a>
      )
    }

    this._renderPlacesColor();

    let cursor = 'default';
    if( isPickLocation ) cursor = 'crosshair'
    if( isMapDragged ) cursor = 'grab'
    if( isPlaceDragged ) cursor = 'move'
    return (
      <div >
        <style dangerouslySetInnerHTML={{__html: specialStyles}}/>
        <div style={styles.mapContainer}>

          {/* map pannel */}
          <div className="mapSVG"
            onWheel={this.onMapWheel.bind(this)}
            onMouseMove={this.onMapDrag.bind(this)}
            onMouseDown={this.onMapDragStart.bind(this)}
            onMouseLeave={this.onMapLeave.bind(this)}
            onClick={this.onMapClick.bind(this)}
            style={{...styles.mapPannel, cursor: ''}}
          >
            {map.mapSVG && <ReactSVG
              src={map.mapSVG}
              beforeInjection={this.loadSVG}
            />}
          </div>

          {/* Menu pannel */}
          <div style={styles.menuPannel}>
            <a style={styles.menuBtn}
              onClick={this.onSaveMapData.bind(this)} >
              <span>Save Map Data</span>
            </a>
          </div>

          {/* level pannel */}
          <div style={styles.levelPannel}>
            {levelsArr}
          </div>

           {/*tool pannel*/}
          <MapEditorPannel
            map={map}
            activePannel={activePannel}
            curLevelIdx={curLevelIdx}
            curPlaceId={curPlaceId}
            curDirectionId={curDirectionId}
            onSelectPannel={this.onSelectPannel.bind(this)}
            onPickLocation={this.onPickLocation.bind(this)}
            onPlaceClick={this.onPlaceClick.bind(this)}
            onPlaceName={this.onPlaceName.bind(this)}
            onPlaceType={this.onPlaceType.bind(this)}
            onPlaceSubType={this.onPlaceSubType.bind(this)}
            onPlaceConnection={this.onPlaceConnection.bind(this)}
            onConnectionTime={this.onConnectionTime.bind(this)}
            onWheelchairCheckChange={this.onWheelchairCheckChange.bind(this)}
            onStairDistChange={this.onStairDistChange.bind(this)}
            onPlaceStatus={this.onPlaceStatus.bind(this)}
            onAddPlace={this.onAddPlace.bind(this)}
            onDeletePlace={this.onDeletePlace.bind(this)}
            onDrawingPath={this.onDrawingPath.bind(this)}
            onDirectionClick={this.onDirectionClick.bind(this)}
            onDirectionStatus={this.onDirectionStatus.bind(this)}
            onDeleteDirection={this.onDeleteDirection.bind(this)}
            onPickDirection={this.onPickDirection.bind(this)}
            onAmenityGroupByCheckChange={this.onAmenityGroupByCheckChange.bind(this)}
            addPlaceX={addPlaceX}
            addPlaceY={addPlaceY}
          />


        </div>


      </div>

    );
  }
}

const styles = {
  mapContainer: {
    position: 'relative',
    width: MAP_EDITOR_WIDTH,
    height: MAP_EDITOR_HEIGHT,
    overflow: 'hidden',
    border: '1px solid #999',
  },
  mapPannel: {
  },
  menuPannel: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  menuBtn: {
    backgroundColor: '#fff',
    padding: '10px 15px',
    display: 'inline-block',
    border: '1px solid #999',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    color: '#333',
    cursor: 'pointer'
  },
  pannelWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 300,
    height: '100%'
  },
  pannelPan: {
    height: '100%',
    margin: 0
  },
  toolBtn: {
    width: '100%',
    paddingTop: 'calc( 100% + 1px )',
    position: 'relative'
  },
  toolBtnLink: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    padding: 0,
    paddingTop: '100%',
    textAlign: 'center',
    border: '1px solid #666',
    display: 'inline-block',
    backgroundColor: '#eee',
    borderTopWidth: 0,
    borderRightWidth: 0,
    cursor: 'pointer',
    borderRadius: 0,
  },
  toolBtnImg: {
    position: 'absolute',
    left: 11,
    top: 11,
    width: 30,
    height: 30,
  },
  levelPannel: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  levelBtn: {
    backgroundColor: '#fff',
    padding: '10px 15px',
    display: 'inline-block',
    border: '1px solid #999',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    color: '#333',
    cursor: 'pointer'
  },
  placesPannel: {
    padding: 10
  },
  placesPannelTitle: {
    marginBottom: 10
  },
  placesPannelContent: {
    height: MAP_EDITOR_HEIGHT-50,
    overflow: 'auto'
  },
  placesElemHeader: {
    padding: 0
  },
  placesElemHeaderLink: {
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    paddingLeft: '20px',
    "&:hover": {
      backgroundColor: '#ddd'
    }
  },
  placesElemHeaderLinkStatus: {
    width: 12,
    height: 12,
    backgroundColor: '#dc3545',
    float: 'right',
    borderRadius: 6,
    marginTop: 5
  }
}

const specialStyles = `
.placesElemHeaderLink:hover {
  background-color: #eee
}
`
