import React, {PureComponent} from 'react';
import {ReactSVG} from 'react-svg'


import {Row, Col, Button, Nav, Card, Form,FormGroup,Label,FormText,Input} from 'reactstrap';
import cloneDeep from 'lodash/cloneDeep'

import './animstyle.scss'

import { gsap,Linear } from "gsap";

import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";

import {
    PLACES_TYPES,
    DESTINATIONS_TYPES,
    CONNECTIONS_TYPES,
    REAL_CONNECTIONS_TYPES,
    AMENITIES_TYPES
} from "./MapEditor";
import MapViewerSearchPannel from "./MapViewerSearchPannel";

export const ROUTE_SEARCH_OPTIONS = ['bestRoute', 'lessWalk', 'wheelChair']

var createGraph = require('ngraph.graph');
let path = require('ngraph.path');

const MAP_EDITOR_WIDTH = '100%'
const MAP_EDITOR_HEIGHT = 675
const PLACES_BACKGROUND_COLOR = 'rgba(188,34,49,1)'
const PLACES_BACKGROUND_COLOR_SEL = 'rgba(230,34,49,1)'
const PLACES_BACKGROUND_COLOR_SETTED = 'rgba(40,167,69,1)'
const PLACES_BACKGROUND_COLOR_HOVER = 'rgba(230,34,49,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_SEL = 'rgba(255,255,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_ENABLE = 'rgba(255,200,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_FIRST = 'rgba(0,200,25,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_FROM = 'rgba(0,0,255,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_TO = 'rgba(255,0,0,1)'
const PLACES_CIRCLE_BACKGROUND_COLOR_AMENITIES = 'rgba(22,116,0,1)'
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
const Path_AnimationSpeed = 10;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

var tween= null;
var prevAlpha = 0;
var prevExecuteTime = 0;
var animTimer =  null;


export default class MapViewer extends PureComponent {

    arrowStr;
    constructor(props) {
        super(props);

        let map = this.props.map;

        this.state = {
            map: map,
            curLevelIdx: 0,
            svg: null,
            mapZoom: 1,
            mapDragStart: false,
            mapOffset: {x: 0, y: 0},
            fromPlace: null,
            toPlace: null,
            isRefresh: true,
            graph: null,
            stair_check: false,
            elevator_check: false,
            escalator_check: false,
            routeSearchOption: ROUTE_SEARCH_OPTIONS[0],

            totalTime: 0,
            totalTimeStr: '',
            totalDist: 0,
            arrowStr:'',
            originalFillColor:'',
            map_rotate:0,
        };

        this.loadSVG = this.loadSVG.bind(this)
    }


    /********************************************************************************** */
    /****************************  React Component Callback  ************************** */
    componentDidMount() {
        const script = document.createElement("script");
        script.src = "../../../node_modules/snapsvg/dist/snap.svg.js";
        script.async = true;
        script.onload = () => this.scriptLoaded();

        document.body.appendChild(script);
    }

    scriptLoaded() {
        console.log('snap svg js file load')
        let Snap;

        // Snap.path('');
        // var snapC = Snap(".injected-svg");

    }


    componentWillReceiveProps(nextProps) {
        let map = nextProps.map;


        if (map.mapData && typeof map.mapData === 'string' && map.mapData !== '{}') {
            // console.log('-- componentWillReceiveProps map : ', map.mapData);
            map.mapData = JSON.parse(map.mapData)

            this.setState({
                map: map,
                isRefresh: true
            })

            let that = this;
            setTimeout(function () {
                let graph = that._getGraphFromMapData(map);
                console.log('-- componentWillReceiveProps graph : ', graph);

                that.setState({
                    graph: graph,
                    isRefresh: false
                })
            }, 10)
        } else if (map && map.mapSVG !== undefined && typeof map.mapData === 'string' && map.mapData === '{}') {
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

    _getPlaceData = (map, levelId, placeId) => {
        let mapData = map.mapData;
        if (mapData && mapData.levels && mapData.levels.length > 0) {
            for (var i = 0; i < mapData.levels.length; i++) {
                let level = mapData.levels[i];
                if (levelId != null && level.id !== levelId) continue;
                if (level && level.places && level.places.length > 0) {
                    for (var j = 0; j < level.places.length; j++) {
                        let place = level.places[j];
                        if (place.id !== placeId) continue;
                        return place;
                    }
                }
            }
        }

        return null;
    }


    _getDirectionData = (map, levelId, directionId) => {
        let mapData = map.mapData;
        if (mapData && mapData.levels && mapData.levels.length > 0) {
            for (var i = 0; i < mapData.levels.length; i++) {
                let level = mapData.levels[i];
                if (level.id !== levelId) continue;
                if (level && level.directions && level.directions.length > 0) {
                    for (var j = 0; j < level.directions.length; j++) {
                        let direction = level.directions[j];
                        if (direction.id !== directionId) continue;
                        return direction;
                    }
                }
            }
        }

        return null;
    }


    _addInteractionPlaceToGraph = (graph, map, place, levelId) => {

        let direction = this._getDirectionData(map, levelId, place.direction);
        let placeA = this._getPlaceData(map, levelId, direction.placeA);
        let placeB = this._getPlaceData(map, levelId, direction.placeB);

        let interactionPos = this._calcInteractionPos(levelId, place);
        let curTime = new Date();

        let speed = this.props.speed;
        let map_scale = this.props.map_scale;

        // console.log('_addInteractionPlaceToGraph ***********************');
        // console.log('speed', this.props.speed);
        // console.log('map_scale', this.props.map_scale);


        let interactionPlace = {
            id: 'i_' + curTime.getTime(),
            levelId: levelId,
            fillId: '',
            name: '',
            x: 0,
            y: 0,
            absX: interactionPos.x,
            absY: interactionPos.y,
            type: 'interaction',
            status: true
        }

        graph.addNode(interactionPlace.id, interactionPlace)

        let node = graph.getNode(interactionPlace.id);
        console.log('--** interactionPlace : ', node)

        let directionAIId = 'l_' + (curTime.getTime() + 1);
        console.log('-- directionAIId', directionAIId)

        let dx = placeA.absX - interactionPlace.absX;
        let dy = placeA.absY - interactionPlace.absY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let time = dist / speed;

        let directionAI = {
            id: directionAIId,
            placeA: placeA.id,
            placeB: interactionPlace.id,
            status: direction.status,
            isWheelchair: direction.isWheelchair,
            role: direction.role,
            time: time,
            dist: dist,
        }

        graph.addLink(placeA.id, interactionPlace.id, directionAI)

        let directionBIId = 'l_' + (curTime.getTime() + 2);
        console.log('-- directionBIId', directionBIId)

        dx = placeB.absX - interactionPlace.absX;
        dy = placeB.absY - interactionPlace.absY;
        dist = Math.sqrt(dx * dx + dy * dy);
        time = dist / speed;


        let directionBI = {
            id: directionBIId,
            placeA: placeB.id,
            placeB: interactionPlace.id,
            status: direction.status,
            isWheelchair: direction.isWheelchair,
            role: direction.role,
            time: time,
            dist: dist,
        }

        graph.addLink(placeB.id, interactionPlace.id, directionBI)

        let directionPIId = 'l_' + (curTime.getTime() + 3);
        console.log('-- directionPIId', directionPIId)

        dx = place.absX - interactionPlace.absX;
        dy = place.absY - interactionPlace.absY;
        dist = Math.sqrt(dx * dx + dy * dy);
        time = dist / speed;

        let directionPI = {
            id: directionPIId,
            placeA: place.id,
            placeB: interactionPlace.id,
            status: place.status,
            isWheelchair: place.isWheelchair,
            role: place.role,
            time: time,
            dist: dist,
        }

        graph.addLink(place.id, interactionPlace.id, directionPI)

        return graph;
    }


    _getGraphFromMapData = (map) => {

        console.error('the _getGraphFromMapData ');

        let speed = this.props.speed;
        let map_scale = this.props.map_scale;

        // console.log('speed', this.props.speed);
        // console.log('map_scale', this.props.map_scale);


        if (map && map.mapData && map.mapData.levels && map.mapData.levels.length > 0) {
            let graph = createGraph();
            let levels = map.mapData.levels;

            let dist = 0;
            let time = 0;

            for (var i = 0; i < levels.length; i++) {
                let places = levels[i].places;
                let directions = levels[i].directions;
                let that = this;
                directions.map(direction => {
                    let placeA = that._getPlaceData(map, levels[i].id, direction.placeA);
                    let placeB = that._getPlaceData(map, levels[i].id, direction.placeB);

                    if (placeA.absX !== undefined && placeA.absY !== undefined && placeB.absX !== undefined && placeB.absY !== undefined) {
                        let dx = placeA.absX - placeB.absX;
                        let dy = placeA.absY - placeB.absY;
                        dist = Math.sqrt(dx * dx + dy * dy);
                        console.log(dist)
                        time = dist / speed;
                        direction.time = time;
                        direction.dist = dist;
                    }

                    graph.addNode(placeA.id, placeA)
                    graph.addNode(placeB.id, placeB)
                    graph.addLink(placeA.id, placeB.id, direction)
                })

                places.map(async (place, index) => {

                    if (place.status && CONNECTIONS_TYPES.includes(place.type) && place.direction != undefined && place.direction != '') {

                        graph.addNode(place.id, place)

                        // graph = await that._addInteractionPlaceToGraph(graph, map, place, levels[i].id);

                        setTimeout(function (i) {
                            console.log('---- ', levels, i)
                            graph = that._addInteractionPlaceToGraph(graph, map, place, levels[i].id);
                        }, index * 10, i)
                    }

                    if (place.status && CONNECTIONS_TYPES.includes(place.type) && place.connection != undefined && place.connection != '') {

                        console.log(' the connection node :', place.type, place.isWheelchair)

                        let connection = that._getPlaceData(map, null, place.connection);
                        if (connection) {
                            let curTime = new Date();
                            let directionId = 'l_' + (curTime.getTime() + 1);

                            console.log('the add the connector', place.type, connection);

                            let time = parseFloat(place.time);

                            if (this.state.routeSearchOption === ROUTE_SEARCH_OPTIONS[2]) {
                                if (place.type === 'escalator') {
                                    if (place.isWheelchair === false || place.isWheelchair === undefined) {
                                        console.log('this connector not wheelchair is removed ');
                                        return;
                                    }
                                } else if (place.type === 'stair') {
                                    console.log('the stair is removed')
                                    return;
                                }
                            }


                            if (place.type === 'stair') {
                                let stairDist = parseFloat(place.stairDist)

                                if (isNaN(stairDist) || place.stairDist == undefined) {
                                    stairDist = STAIR_DIST;
                                }

                                let direction = {
                                    id: directionId,
                                    placeA: place.id,
                                    placeB: connection.id,
                                    status: place.status && connection.status,
                                    isWheelchair: place.isWheelchair && console.isWheelchair,
                                    role: place.role,
                                    time: time,
                                    connection: true,
                                    type: place.type,
                                    dist: stairDist,
                                }
                                graph.addLink(place.id, place.connection, direction)
                            } else {
                                let direction = {
                                    id: directionId,
                                    placeA: place.id,
                                    placeB: connection.id,
                                    status: place.status && connection.status,
                                    isWheelchair: place.isWheelchair && console.isWheelchair,
                                    role: place.role,
                                    time: time,
                                    connection: true,
                                    type: place.type,
                                    dist: 0,
                                }
                                graph.addLink(place.id, place.connection, direction)
                            }
                        }
                    }
                })
            }

            console.log('after _getGraphFromMapData****************************')
            console.log('nodes counts', graph.getNodesCount())
            console.log('links counts', graph.getLinksCount())

            return graph
        }

        return null;

    }
    /******************************  Private Function end ***************************** */
    /********************************************************************************** */


    /********************************************************************************** */
    /*******************************  Component Callback  ***************************** */
    loadSVG = (svg) => {
        let {map} = this.state;
        const levelElems = [...svg.querySelectorAll('g[id^=level]')]

        let levelElemCount = 0
        for (let i = 0; i < levelElems.length; i++) {
            let levelElem = levelElems[i];
            let levelId = levelElem.id;
            if (levelId.indexOf('_') > -1) continue
            levelElemCount++;
        }

        let levels = [];
        let levelCount = 0
        for (let i = 0; i < levelElemCount; i++) {
            let levelElem = [...svg.querySelectorAll('g[id=level' + i + ']')];
            levelElem = levelElem[0];
            let levelId = levelElem.id;

            // Move to valid area. This is because map is in left-top corner when loading time.
            // So, we need to move it to center position of screen. [540, 200]
            let matrix = levelElem.parentNode.transform.baseVal[0].matrix;
            matrix = matrix.translate(this.props.offset.x, this.props.offset.y);
            levelElem.parentNode.transform.baseVal[0].setMatrix(matrix);

            // if level is not first level, hide level elem.
            if (levelCount !== this.state.curLevelIdx)
                levelElem.parentNode.setAttribute('visibility', 'hidden');


            if (levelElem.parentNode.hasAttribute("transform")) {
                var transformStr = levelElem.parentNode.getAttribute("transform");
                console.log('transform hasAttribute:',transformStr);
                const rotateStr = ' rotate(' +  this.state.map_rotate + ')';
                if(!transformStr.includes('rotate')){
                    levelElem.parentNode.setAttribute("transform", transformStr + rotateStr)
                }
            }

            levelCount++;
        }

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
        if (map.mapData && map.mapData.levels) levels = map.mapData.levels;
        if (svg === null || levels.length === 0) return;

        for (let i = 0; i < levels.length; i++) {
            let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
            if (levelElem.length > 0) {
                levelElem = levelElem[0];

                if (i === levelIdx) {
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


        let levelId = 'level' + levelIdx;


        let path_finder_id = "#draw_path_find_" + levelId ;
        let _path = document.querySelector(path_finder_id);

        if(_path == null){
            let triangles =  document.querySelectorAll('.draw_triangle');
            for(let triangle of triangles){
                triangle.setAttribute('visibility','hidden');
            }
            return;
        }

        let length = _path.getTotalLength();
        if(length === 0){
            let triangles =  document.querySelectorAll('.draw_triangle');
            for(let triangle of triangles){
                triangle.setAttribute('visibility','hidden');
            }
            return;
        }



        let triangles =  document.querySelectorAll('.draw_triangle');
        for(let triangle of triangles){
            triangle.setAttribute('visibility','visible');
        }


        if(tween){
            tween.kill();
            tween = null;
        }

            // register the plugin
        gsap.registerPlugin(MotionPathPlugin);

// set the element to rotate from it's center
        gsap.set([".draw_triangle", ".draw_triangle--self"], {
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "50% 50%"
        });

// animate the rocket along the path

        //draw_navigation_

        console.log('path_finder_id',path_finder_id)

        let animTime =  Math.floor(length/Path_AnimationSpeed);



        tween = gsap.to(".draw_triangle", {
            motionPath: {
                path: path_finder_id,
                align: path_finder_id,
                autoRotate: true,
            },
            onUpdate:this.updateFunction,
            onUpdateParams:[levelId,this],
            duration: animTime,
            repeat: -1,
            ease: Linear.easeNone,
            immediateRender: true,
        });
    }

    /*****************************  Component Callback end **************************** */
    /********************************************************************************** */


    /********************************************************************************** */
    /*****************************  Map Drag & Zoom start  **************************** */
    onMapWheel = (e) => {
        let {mapZoom} = this.state;
        mapZoom -= e.deltaY / 500;
        if (mapZoom > 0 && mapZoom <= 5) {
            this.mapZoom(mapZoom);
        }
    }


    onMapDrag = (e) => {
        let {mapDragStart, mapOffset, dragStart, placeDragStart, placeDragEnd, svg, map, curLevelIdx, curPlaceId} = this.state;
        let curTime = Date.now();
        let offsetX = 0, offsetY = 0, offsetX1 = e.nativeEvent.movementX, offsetY1 = e.nativeEvent.movementY;

        if (mapDragStart && curTime - dragStart > 200) {
            mapOffset.x += e.nativeEvent.movementX;
            mapOffset.y += e.nativeEvent.movementY;
            this.mapDrag(mapOffset);
            return;
        }

    }


    onMapDragStart = (e) => {
        this.setState({
            mapDragStart: true,
            dragStart: Date.now(),
            isRefresh: false
        })
    }


    onMapLeave = (e) => {
        this.setState({
            mapDragStart: false,
            dragStart: NaN,
            isRefresh: false
        })
    }


    onMapClick = (e) => {
        let isRefresh = false;

        this.setState({
            mapDragStart: false,
            isMapDragged: false,
            dragStart: NaN,
            isRefresh: isRefresh,
        })


    }


    mapZoom = (mapZoom) => {
        let {svg, map, mapOffset} = this.state;
        let levels = [];
        if (map.mapData && map.mapData.levels) levels = map.mapData.levels;
        if (svg === null || levels.length === 0) return;

        let matrix = svg.createSVGMatrix();
        matrix = matrix.scale(mapZoom);
        matrix = matrix.translate(mapOffset.x, mapOffset.y)

        for (let i = 0; i < levels.length; i++) {
            let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
            if (levelElem.length > 0) {
                levelElem = levelElem[0];
                levelElem.parentNode.transform.baseVal[0].setMatrix(matrix)

                this.rotateElem(levelElem.parentNode,this.state.map_rotate);
            }
        }

        this.setState({
            mapZoom: mapZoom,
            isRefresh: false
        })
    }

    mapRotate = (rotate) => {
        let {svg, map } = this.state;
        let levels = [];
        if (map.mapData && map.mapData.levels) levels = map.mapData.levels;
        if (svg === null || levels.length === 0) return;

        for (let i = 0; i < levels.length; i++) {
            let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
            if (levelElem.length > 0) {
                levelElem = levelElem[0];
                this.rotateElem(levelElem.parentNode,rotate);
                if(levelElem.childNodes.length > 2){
                    if(levelElem.childNodes[1].tagName == "g"){
                        levelElem.childNodes[1].childNodes.forEach( node => {
                            if( node.tagName == "g" && node.id !== undefined && node.id !== "" && node.id.length > 0){
                                const firstId  = node.id.charAt(0).toString();
                                 if( node.id.substring(0,2) != 'd_'){
                                     // this.rotateLogoImageBox(node,rotate);
                                 }
                            }
                        });
                    }
                }
            }
        }



        let targetGid = document.getElementById('target_marker_text_box');
        if(targetGid){
            this.rotateTextBox(targetGid,rotate);
        }

        let startGid = document.getElementById('current_marker_text_box');
        if(startGid){
            this.rotateTextBox(startGid,rotate);
        }

        this.setState({
            map_rotate: rotate,
            isRefresh: false
        })
    }
    rotateLogoImageBox = (elem,rotate) => {

        var bounds = elem.getBBox()
        //+ ' skewX( -' + 20 + ')'

        const rotateStr = ' rotate( -' +  rotate + ',' + bounds.x + ',' + bounds.y + ')' ;

        if (elem.hasAttribute("transform")) {

            var transformStr = elem.getAttribute("transform");

            if(!transformStr.includes('rotate')){
                elem.setAttribute("transform", transformStr + rotateStr)
            }else{
                if(transformStr.includes('matrix')){
                    const matrixAttr = transformStr.match(new RegExp('matrix' + "(.*)" + 'rotate'));
                    if(matrixAttr.length > 1){
                        const matrixStr = matrixAttr[1];
                        elem.setAttribute("transform", 'matrix' + matrixStr + rotateStr)
                    }
                }else{
                    elem.setAttribute("transform", rotateStr)
                }
            }
        }else{
            elem.setAttribute("transform",  rotateStr)
        }
        // if (elem.hasAttribute("transform")) {
        //     elem.setAttribute("transform", elem.getAttribute("transform"))
        // }

    }



    rotateTextBox = (elem,rotate) => {

        var bounds = elem.getBBox()
        const rotateStr = ' rotate( -' +  rotate + ',' + bounds.x + ',' + bounds.y + ')';
        elem.setAttribute("transform",  rotateStr)

        // if (elem.hasAttribute("transform")) {
        //     elem.setAttribute("transform", elem.getAttribute("transform"))
        // }

    }

    rotateElem = (elem,rotate) => {
        if (elem.hasAttribute("transform")) {

            var transformStr = elem.getAttribute("transform");

            const rotateStr = ' rotate(' +  rotate.toString() + ')';

            if(!transformStr.includes('rotate')){
                elem.setAttribute("transform", transformStr + rotateStr)
            }else{
                if(transformStr.includes('matrix')){
                    const matrixAttr = transformStr.match(new RegExp('matrix' + "(.*)" + 'rotate'));
                    if(matrixAttr.length > 1){
                        const matrixStr = matrixAttr[1];
                        elem.setAttribute("transform", 'matrix' + matrixStr + rotateStr)
                    }
                }else{
                    elem.setAttribute("transform", rotateStr)
                }
            }
        }
    }


    mapDrag = (mapOffset) => {
        let {svg, map, mapZoom} = this.state;
        let levels = [];
        if (map.mapData && map.mapData.levels) levels = map.mapData.levels;
        if (svg === null || levels.length === 0) return;

        let matrix = svg.createSVGMatrix();
        matrix = matrix.scale(mapZoom);
        matrix = matrix.translate(mapOffset.x, mapOffset.y)

        for (let i = 0; i < levels.length; i++) {
            let levelElem = [...svg.querySelectorAll('g[id=' + levels[i].id + ']')];
            if (levelElem.length > 0) {
                levelElem = levelElem[0];
                levelElem.parentNode.transform.baseVal[0].setMatrix(matrix)

                this.rotateElem(levelElem.parentNode,this.state.map_rotate);
            }
        }

        this.setState({
            mapOffset: mapOffset,
            isMapDragged: true,
            isRefresh: false
        }, () => {
            // this.addScalePath()
        })
    }
    /******************************  Map Drag & Zoom End  ***************************** */
    /********************************************************************************** */


    _refreshMap = () => {
        let {svg} = this.state;
        svg.innerHTML += "";
    }


    _addPlaceCircle = (place, type) => {
        // type : from, to, connection

        let {svg} = this.state;
        let levelElem = [...svg.querySelectorAll('g[id=' + place.levelId + ']')];
        let circle = document.createElement('circle');
        circle.setAttribute('cx', place.absX)
        circle.setAttribute('cy', place.absY)
        circle.setAttribute('r', PLACE_RADIUS)
        circle.setAttribute('stroke', 'rgba(255,170,0,0)')
        circle.setAttribute('stroke-width', 2)



        let triangle =  document.createElement('circle');
        triangle.setAttribute('r', PLACE_RADIUS)
        triangle.setAttribute('stroke', 'rgba(20,250,0,0)')
        triangle.setAttribute('stroke-width', 2)


        triangle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_TO);
        triangle.setAttribute('class', 'draw_triangle');


        let g = document.createElement('g');
        g.setAttribute('id', 'navigation_marker_' + type + '_' + place.id)



        let color = PLACES_CIRCLE_BACKGROUND_COLOR_FROM;
        if (type == 'from') {
            color = PLACES_CIRCLE_BACKGROUND_COLOR_FIRST;
            g.appendChild(circle);
        }
        else if (type == 'to')
        {
            circle.setAttribute('class', 'rocket');
            color = PLACES_CIRCLE_BACKGROUND_COLOR_TO;
        }
        else if (type == 'connection') color = PLACES_CIRCLE_BACKGROUND_COLOR_FROM;
        circle.setAttribute('fill', color);

        if(type === 'to'){

            let markers = [...svg.querySelectorAll('g[id^=target_marker]')];
            for (var i = 0; i < markers.length; i++) {
                markers[i].parentNode.removeChild(markers[i])
            }



            var svgNS = "http://www.w3.org/2000/svg";
            var newText = document.createElementNS(svgNS, "text");
            newText.setAttributeNS(null, "x", place.absX   + 20);
            newText.setAttributeNS(null, "y", place.absY   + 20);
            newText.setAttributeNS(null, "font-size", "10");
            newText.setAttributeNS(null, "fill", "white");

            newText.setAttributeNS(null, "id", "target_position_text");

            newText.innerHTML = place.name

            let gtext = document.createElement('g');
            gtext.setAttribute('id', 'target_marker_text_box')
            gtext.appendChild(newText);


            this.element = document.createElement('canvas');
            this.context = this.element.getContext("2d");
            this.context.font = "10px Arial";
            var width = this.context.measureText(place.name).width;





            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", place.absX + 20  - 6 );
            rect.setAttribute("y", place.absY + 10 - 2);
            rect.setAttribute("width", width + 8 );
            rect.setAttribute("height", 17);
            rect.setAttribute("fill", "rgb(226,58,48)");
            rect.setAttribute("rx", 5);
            gtext.insertBefore(rect, newText);


            var array =  [ [place.absX + 3 ,place.absY + 3  ],
                [ place.absX + 23,place.absY + 13],
                [ place.absX + 26,place.absY + 18],
                ];

            let triangle =  document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            for (var i= 0; i< array.length;i++) {
                var value =  array [i];
                var point = svg.createSVGPoint();
                point.x = value[0];
                point.y = value[1];
                triangle.points.appendItem(point);
            }
            triangle.setAttribute('stroke', 'rgba(182,37,33,1)')
            triangle.setAttribute('stroke-width', 2)
            triangle.setAttribute('fill', 'rgba(182,37,33,1)');
            gtext.insertBefore(triangle, rect);
            levelElem[0].parentNode.appendChild(gtext)



            const rotateStr = ' rotate( -' +  this.state.map_rotate + ',' + place.absX + ',' + place.absY + ')';
            gtext.setAttribute("transform",  rotateStr)



            let targetGid = document.getElementById(place.fillId);
            // let targetGid = [...svg.querySelectorAll( place.id )];
            console.log('the target id' ,place.id ,targetGid)

            if(targetGid){
                targetGid.childNodes.forEach( node => {
                    if(node.parentNode.id == place.fillId && node.tagName === 'path'){
                        // node.fill = 'rgba(182,37,33,1)';
                        var originalFillColor = node.getAttribute('fill')

                        node.setAttribute('fill', 'rgba(130,0,0,1)');
                        console.log('the target fill id color change', node,originalFillColor)
                        this.setState({
                            originalFillColor:originalFillColor,
                        })
                    }

                })
            }
        }


        if (type === 'from') {

            let markers = [...svg.querySelectorAll('g[id^=current_marker]')];
            for (var i = 0; i < markers.length; i++) {
                markers[i].parentNode.removeChild(markers[i])
            }

            var svgNS = "http://www.w3.org/2000/svg";
            var para = "YOU ARE HERE";
            var newText = document.createElementNS(svgNS, "text");
            newText.setAttributeNS(null, "x", place.absX + 46 );
            newText.setAttributeNS(null, "y", place.absY );
            newText.setAttributeNS(null, "font-size", "8");
            newText.setAttributeNS(null, "fill", "white");
            newText.setAttributeNS(null, "id", "current_position_text");
            newText.innerHTML= para

            let gtext = document.createElement('g');

            gtext.setAttribute('id', 'current_marker_text_box')
            gtext.appendChild(newText);

            this.element = document.createElement('canvas');
            this.context = this.element.getContext("2d");
            this.context.font = "8px Arial";
            var width = this.context.measureText(para).width;


            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", place.absX + 42 );
            rect.setAttribute("y", place.absY - 11);
            rect.setAttribute("width",width + 3);
            rect.setAttribute("height",15);
            rect.setAttribute("fill", "rgb(226,58,48)");
            rect.setAttribute("rx", 5);
            gtext.insertBefore(rect, newText);


            var array =  [ [place.absX,place.absY],
                [ place.absX + 42,place.absY ],
                [ place.absX + 42,place.absY  - 3],
            ];

            let triangle =  document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            for (var i= 0; i< array.length;i++) {
                var value =  array [i];
                var point = svg.createSVGPoint();
                point.x = value[0];
                point.y = value[1];
                triangle.points.appendItem(point);
            }
            triangle.setAttribute('stroke', 'rgba(182,37,33,1)')
            triangle.setAttribute('stroke-width', 2)
            triangle.setAttribute('fill', 'rgba(182,37,33,1)');
            gtext.insertBefore(triangle, rect);


            const rotateStr = ' rotate( -' +  this.state.map_rotate + ',' + place.absX + ',' + place.absY + ')';
            gtext.setAttribute("transform",  rotateStr)




            let absX = place.absX + 20;
            let absY = place.absY + 20;


            var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            newLine.setAttribute('id', 'line2');
            newLine.setAttribute('x1', absX);
            newLine.setAttribute('y1', absY);
            newLine.setAttribute('x2', absX + 50);
            newLine.setAttribute('y2', absY);
            newLine.setAttribute("stroke", "black")

            var svgNS = "http://www.w3.org/2000/svg";
            var newText = document.createElementNS(svgNS, "text");
            newText.setAttributeNS(null, "x", absX + 15);
            newText.setAttributeNS(null, "y", absY - 5);
            newText.setAttributeNS(null, "font-size", "10");
            newText.setAttributeNS(null, "fill", "blue");
            newText.innerHTML = this.props.map_scale * 50 + ' meter';
            // let gtext = document.createElement('g');
            // gtext.setAttribute('id', type+'_'+place.id + 'text')

            // gtext.appendChild( newText );
            // gtext.appendChild( newLine );

            levelElem[0].parentNode.appendChild(gtext)

        }

        levelElem[0].parentNode.appendChild(g)

        this._refreshMap()
    }

    onRouteOptionChange = (value) => {
        let {map, curLevelIdx} = this.state;
        console.log(value)

        if(tween){
            tween.pause();
            tween.kill();
        }

        this.setState({
            routeSearchOption: value,
        }, () => {
            console.log('the value', this.state.routeSearchOption)
            let graph = this._getGraphFromMapData(map);
            let fromPlace = this.state.fromPlace;
            let toPlace = this.state.toPlace;
            this.setState({
                graph: graph,
                isRefresh: false,
                fromPlace: null,
                toPlace:null,
            }, () => {
                console.error('the graph update route option change', this.state.routeSearchOption);
                // this.eraseRoute()
                // this.onSearchPlaces(fromPlace,toPlace)
                let that = this;
                setTimeout(function () {
                    that.onSearchPlaces(fromPlace, toPlace)
                }, 1500)
            })
        })
    }

    onCheckChange = (event) => {
        console.log('check box  event', event.target)

        let {map, curLevelIdx} = this.state;
        let {
            stair_check,
            elevator_check,
            escalator_check
        } = this.state;
        if (event.target.id === 'check_stair') {
            this.setState({
                stair_check: !stair_check,
            }, () => {
                let graph = this._getGraphFromMapData(map);
                this.setState({
                    graph: graph
                }, () => {
                    console.error('the graph update setted stair');
                    // this.onSearchPlaces(this.state.fromPlace,this.state.toPlace)
                })
            })

        } else if (event.target.id === 'check_elevator') {
            this.setState({
                elevator_check: !elevator_check,
            }, () => {

                let graph = this._getGraphFromMapData(map);
                this.setState({
                    graph: graph
                }, () => {
                    console.error('the graph update setted elevator');
                    // this.findPath();
                })
            })
        } else if (event.target.id === 'check_escalator') {
            this.setState({
                escalator_check: !escalator_check,
            }, () => {

                let graph = this._getGraphFromMapData(map);
                this.setState({
                    graph: graph
                }, () => {
                    console.error('the graph update setted escalator');
                    // this.findPath();
                })
            })
        }
    }

    eraseRoute = () => {

        let {svg, fromPlace, toPlace} = this.state;

        let curLevelIdx = 0;
        if (fromPlace != null) {
            let placeElem = [...svg.querySelectorAll('g[id^=from_]')];
            if (placeElem[0])
                placeElem[0].parentNode.removeChild(placeElem[0]);
            // this._addPlaceCircle( fromPlace, 'from' )
            curLevelIdx = fromPlace.levelId;
            curLevelIdx = parseInt(curLevelIdx.replace('level', ''));
        }
        if (toPlace != null) {
            let placeElem = [...svg.querySelectorAll('g[id^=to_]')];
            if (placeElem[0])
                placeElem[0].parentNode.removeChild(placeElem[0]);
            // this._addPlaceCircle( toPlace, 'to' )
            curLevelIdx = toPlace.levelId;
            curLevelIdx = parseInt(curLevelIdx.replace('level', ''));
        }

        let placeElems = [...svg.querySelectorAll('g[id^=path_find]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }

        placeElems = [...svg.querySelectorAll('g[id^=connection_]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }

        this.setState({
            fromPlace: fromPlace,
            toPlace: toPlace,
            curLevelIdx: curLevelIdx
        })
        this.onSelectLevel(curLevelIdx);

        console.log('erase route')

    }

    onSearchPlaces = (fromPlace, toPlace) => {

        let {map, svg, graph} = this.state;
        console.log('-- onSearchPlaces : ', fromPlace, toPlace)
        console.log('onSearchPlaces  ****************************')

        if (fromPlace == null || toPlace == null) {
            return
        }

        if(fromPlace.id === toPlace.id){
            return;
        }

        if(this.state.toPlace){
            if(toPlace.id === this.state.toPlace.id){
                return;
            }
        }


        if(tween){
            tween.kill();
            tween = null;
        }

        if(this.state.toPlace && this.state.toPlace.fillId){

            let targetGid = document.getElementById(this.state.toPlace.fillId);
            // let targetGid = [...svg.querySelectorAll( place.id )];
            console.log('the search toPlace id' ,this.state.toPlace ,targetGid)

            if(targetGid){
                targetGid.childNodes.forEach( node => {
                    if(node.parentNode.id === this.state.toPlace.fillId && node.tagName === 'path'){
                        // node.fill = 'rgba(182,37,33,1)';
                        console.log(this.state.originalFillColor)
                        node.setAttribute('fill', this.state.originalFillColor);

                        console.log('the search fill id color change', node)
                    }
                })
            }
        }

        let curLevelIdx = 0;
        if (fromPlace != null && (this.state.fromPlace == null || fromPlace.id != this.state.fromPlace.id)) {
            let placeElem = [...svg.querySelectorAll('g[id^=from_]')];
            if (placeElem[0])
                placeElem[0].parentNode.removeChild(placeElem[0]);
            this._addPlaceCircle(fromPlace, 'from')
            curLevelIdx = fromPlace.levelId;
            curLevelIdx = parseInt(curLevelIdx.replace('level', ''));
        }
        if (toPlace != null && (this.state.toPlace == null || toPlace.id != this.state.toPlace.id)) {
            let placeElem = [...svg.querySelectorAll('g[id^=to_]')];
            if (placeElem[0])
                placeElem[0].parentNode.removeChild(placeElem[0]);


            if (toPlace.groupBy === true) {
                this.drawAmenities(fromPlace, toPlace, toPlace.name)
                return;
            }

            this._addPlaceCircle(toPlace, 'to')
            curLevelIdx = toPlace.levelId;
            curLevelIdx = parseInt(curLevelIdx.replace('level', ''));
        }

        this.setState({
            fromPlace: fromPlace,
            toPlace: toPlace,
            curLevelIdx: curLevelIdx
        })
        this.onSelectLevel(curLevelIdx);

        let that = this;
        setTimeout(function () {
            that.findPath()
        }, 10)

    }


    findPath = () => {
        console.log('the findPath ***************************')

        this.setState({
            totalTime: 0,
            totalTimeStr: '',
            totalDist: 0,
        })


        let {fromPlace, toPlace, graph, map, routeSearchOption} = this.state;

        if (fromPlace == null || toPlace == null) return;
        if(graph == null) return;



        console.log('nodes counts', graph.getNodesCount())
        console.log('links counts', graph.getLinksCount())

        console.log(routeSearchOption)

        let g = cloneDeep(graph);

        if(g == null) return;

        if (fromPlace.status && DESTINATIONS_TYPES.includes(fromPlace.type) && fromPlace.direction != undefined && fromPlace.direction != '') {
            g.addNode(fromPlace.id, fromPlace)
            g = this._addInteractionPlaceToGraph(g, map, fromPlace, fromPlace.levelId);
        } else {
            return;
        }

        let that = this;
        setTimeout(function () {

            if (toPlace.status && DESTINATIONS_TYPES.includes(toPlace.type) && toPlace.direction != undefined && toPlace.direction != '') {
                g.addNode(toPlace.id, toPlace)
                g = that._addInteractionPlaceToGraph(g, map, toPlace, toPlace.levelId);
            } else {
                return;
            }

            let pathFinder = path.nba(g, {
                distance(fromPlace, toPlace, link) {

                    if (link.data.connection !== undefined && link.data.connection) {
                        console.log('findPath distance', fromPlace, toPlace, link);
                    }
                    // console.log("time:",link.data.time)
                    // console.log("dist:",link.data.dist);
                    if (that.state.routeSearchOption === ROUTE_SEARCH_OPTIONS[0]) {
                        return link.data.time;
                    } else if (that.state.routeSearchOption === ROUTE_SEARCH_OPTIONS[1]) {
                        return link.data.dist;
                    } else {
                        return link.data.time;
                    }
                }
            });
            let foundPath = pathFinder.find(fromPlace.id, toPlace.id);

            console.log('-- foundPath : ', foundPath);

            that.getTotalTimeAndDist(foundPath)

            if (foundPath.length > 0) {
                that.renderPath(foundPath);
            } else {
                that.eraseRoute();
            }
        }, 10)
    }

    amenitiesFindPath =  (fromPlace, toPlace) => {

        let {graph, map} = this.state;

        if (fromPlace == null || toPlace == null) return [];

        let g = cloneDeep(graph);

        if (fromPlace.status && DESTINATIONS_TYPES.includes(fromPlace.type) && fromPlace.direction != undefined && fromPlace.direction != '') {
            g.addNode(fromPlace.id, fromPlace)
            g = this._addInteractionPlaceToGraph(g, map, fromPlace, fromPlace.levelId);
        } else {
            return [];
        }
        let that = this;
        setTimeout(function () {

        }, 10);

        if (toPlace.status && DESTINATIONS_TYPES.includes(toPlace.type) && toPlace.direction != undefined && toPlace.direction != '') {
            g.addNode(toPlace.id, toPlace)
            g = that._addInteractionPlaceToGraph(g, map, toPlace, toPlace.levelId);
        } else {
            return [];
        }

        let pathFinder = path.nba(g, {
            distance(fromPlace, toPlace, link) {
                return link.data.dist;
            }
        });

        let foundPath = pathFinder.find(fromPlace.id, toPlace.id);

        console.log('-- amenitiesFindPath foundPath : ', foundPath);
        return foundPath;


    }


    getTotalTimeAndDist = (foundPath) => {
        let totalTime = 0;
        let totalDist = 0;

        let speed = this.props.speed;
        let map_scale = this.props.map_scale;

        if (foundPath.length > 0) {
            for (let i = 0; i < foundPath.length - 1; i++) {
                let curNode = foundPath[i];
                let nextNode = foundPath[i + 1];
                let nextNodeId = nextNode.id;

                // console.log('path node', curNode.data.name, curNode.data.id)
                let curLinks = curNode.links;
                let curlink = null;
                for (let j = 0; j < curLinks.length; j++) {
                    let link = curLinks[j];
                    if (link && ((link.toId === nextNodeId && link.fromId === curNode.id) || (link.fromId === nextNodeId && link.toId === curNode.id))) {
                        curlink = link;
                        break;
                    }
                }
                // console.log(curlink)
                if (curlink && curlink.data.time !== undefined) {
                    totalTime += curlink.data.time;
                    // console.log(curlink.data.time)
                    // console.log(curlink.data.dist)
                    totalDist += curlink.data.dist;
                }
            }

            console.log('the map_scale', map_scale)
            totalTime *= map_scale;
            totalDist *= map_scale;
            console.log('The total Time', totalTime);
            console.log('the total Dist', totalDist);


            let  totalseconds = totalTime*60;
            totalseconds = totalseconds.toFixed(0);
            let  mins =  totalseconds/60;
            mins = Math.floor(mins);
            let seconds = totalseconds%60;

            this.setState({
                totalTimeStr: mins+' min ' + seconds + ' s',
                totalTime: totalTime.toFixed(2),
                totalDist: totalDist.toFixed(2),
            });
            return totalTime;
        }
    }


    drawAmenities = (fromPlace, toPlace, subType) => {

        let {graph, map, svg} = this.state;

        let curLevelId = fromPlace.levelId;
        let curLevelIdx = parseInt(curLevelId.replace('level', ''));

        this.setState({
            fromPlace: fromPlace,
            toPlace: toPlace,
            curLevelIdx: curLevelIdx
        })
        this.onSelectLevel(curLevelIdx);

        let toPlaceName = toPlace.name.toLowerCase();


        console.log('drawAmenities', toPlace.name, curLevelIdx);
        let placeElems = [...svg.querySelectorAll('g[id^=place_amenities]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }

        if (svg && map && map.mapData && map.mapData.levels && map.mapData.levels.length > 0) {
            let levels = map.mapData.levels;
            let level = levels[curLevelIdx];
            let levelElem = [...svg.querySelectorAll('g[id=' + curLevelId + ']')];
            let places = level.places;

            if (places && places.length > 0) {
                for (var j = 0; j < places.length; j++) {
                    let place = places[j];

                    if ((place.status && place.groupBy === true && (place.name.toLowerCase() === toPlaceName ||place.name.toLowerCase().includes(toPlaceName)))) {
                        let circle = document.createElement('circle');
                        circle.setAttribute('cx', place.absX)
                        circle.setAttribute('cy', place.absY)
                        circle.setAttribute('r', PLACE_RADIUS)
                        circle.setAttribute('stroke', PLACES_CIRCLE_BACKGROUND_COLOR_AMENITIES)
                        circle.setAttribute('stroke-width', 2)
                        circle.setAttribute('fill', PLACES_CIRCLE_BACKGROUND_COLOR_AMENITIES);

                        var svgNS = "http://www.w3.org/2000/svg";
                        var newText = document.createElementNS(svgNS, "text");
                        newText.setAttributeNS(null, "x", place.absX + 10);
                        newText.setAttributeNS(null, "y", place.absY);
                        newText.setAttributeNS(null, "font-size", "10");
                        newText.setAttributeNS(null, "fill", "green");

                        newText.innerHTML = subType.charAt(0).toUpperCase() + subType.slice(1);

                        let g = document.createElement('g');
                        g.setAttribute('id', 'place_amenities' + place.id);
                        g.appendChild(circle);
                        g.appendChild(newText);
                        levelElem[0].parentNode.appendChild(g)
                    }
                }

                let amenitiesFoundPath = [];

                for (var j = 0; j < places.length; j++) {
                    let place = places[j];
                    if ((place.status && place.groupBy === true && (place.name.toLowerCase() === toPlaceName || place.name.toLowerCase().includes(toPlaceName)))) {
                        let foundPath = this.amenitiesFindPath(fromPlace, place);
                        console.log('-- amenitiesFindPath foundPath : ', foundPath);
                        if (foundPath.length > 0) {
                            let totalTime = this.getTotalTimeAndDist(foundPath);

                            amenitiesFoundPath.push({
                                totalTime: totalTime,
                                place: place,
                                path: foundPath
                            });
                        }
                    }
                }

                console.log('total amenitiesFoundPath:',amenitiesFoundPath)

                if (amenitiesFoundPath.length > 0) {
                    let path = amenitiesFoundPath[0];
                    for (let i = 1; i < amenitiesFoundPath.length; i++) {
                        if (amenitiesFoundPath[i].totalTime < path.totalTime) {
                            path = amenitiesFoundPath[i];
                        }
                    }

                    this.setState({
                        toPlace: path.place,
                    })

                    this._addPlaceCircle(path.place,'to')

                    console.log('the best way',path)
                    this.renderPath(path.path);

                    // this.setState({
                    //     fromPlace: fromPlace,
                    //     curLevelIdx: curLevelIdx
                    // })

                }
            }
        }
    }

    addScalePath = () => {

        let {svg, map, curLevelIdx} = this.state;

        let placeElems = [...svg.querySelectorAll('g[id^=map_scale_show]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }


        let absX = this.state.mapOffset.x + 200;
        let absY = this.state.mapOffset.y + 100;


        if (svg && map && map.mapData && map.mapData.levels && map.mapData.levels.length > 0) {
            let levels = map.mapData.levels;
            for (var i = 0; i < levels.length; i++) {
                let level = levels[i];
                let levelElem = [...svg.querySelectorAll('g[id=' + level.id + ']')];

                var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                newLine.setAttribute('id', 'line2');
                newLine.setAttribute('x1', absX);
                newLine.setAttribute('y1', absY);
                newLine.setAttribute('x2', absX + 50);
                newLine.setAttribute('y2', absY);
                newLine.setAttribute("stroke", "black")

                let gLine = document.createElement('g');
                gLine.setAttribute('id', 'map_scale_show')

                gLine.appendChild(newLine);
                // levelElem[0].parentNode.appendChild( gLine )


                var svgNS = "http://www.w3.org/2000/svg";
                var newText = document.createElementNS(svgNS, "text");
                newText.setAttributeNS(null, "x", absX + 5);
                newText.setAttributeNS(null, "y", absY);
                newText.setAttributeNS(null, "font-size", "10");
                newText.setAttributeNS(null, "fill", "blue");
                newText.innerHTML = this.props.map_scale * 50 + ' meter';
                // let gtext = document.createElement('g');
                // gtext.setAttribute('id', type+'_'+place.id + 'text')

                gLine.appendChild(newText);
                levelElem[0].parentNode.appendChild(gLine)


            }
        }

        // let levelId = this.state.curLevelIdx;
        // let pathStr = 'M' + 5 + ' ' + 5 + ' L'
        // console.log(this.state.curLevelIdx)
        //
        // let levelElem = [...svg.querySelectorAll('g[id=level'+levelId+']')];
        // console.log('add scale ',levelElem)


    }


    renderPath = (foundPath) => {
        let {svg} = this.state;
        if (foundPath.length < 1) return;

        let levelId = foundPath[foundPath.length - 1].data.levelId;

        let placeElems = [...svg.querySelectorAll('g[id^=path_find]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }

        placeElems = [...svg.querySelectorAll('g[id^=connection_]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }

        placeElems = [...svg.querySelectorAll('g[id^=navigation_marker_]')];
        for (var i = 0; i < placeElems.length; i++) {
            placeElems[i].parentNode.removeChild(placeElems[i])
        }


        let pathStr = 'M' + foundPath[foundPath.length - 1].data.absX.toFixed(3) + ' ' + foundPath[foundPath.length - 1].data.absY.toFixed(3) + ' L'
        for (var i = foundPath.length - 2; i >= 0; i--) {
            if (foundPath[i].data.levelId == levelId) {
                pathStr += foundPath[i].data.absX.toFixed(3) + ' ' + foundPath[i].data.absY.toFixed(3) + ' '
            } else {
                // add path to previous level
                let levelElem = [...svg.querySelectorAll('g[id=' + levelId + ']')];
                let path = document.createElement('path');
                path.setAttribute('d', pathStr)
                path.setAttribute('stroke', 'rgba(240,10,0,1)')
                path.setAttribute('stroke-width', 3)
                path.setAttribute('fill', 'none')
                // path.setAttribute('id', 'draw_path_find_')
                path.setAttribute('id', 'draw_path_find_' + levelId)
                path.setAttribute('class', 'render_draw_path')
                path.setAttribute('stroke-dasharray', 4)

                // path.setAttribute('class', 'draw_path_find')



                console.log('create new path');
                console.log(path)

                let path2 = document.createElement('path');
                path2.setAttribute('d', pathStr)
                path2.setAttribute('stroke', 'rgba(250,0,0,1)')
                path2.setAttribute('stroke-width', 4)
                path2.setAttribute('fill', 'none')
                path2.setAttribute('id', 'anim_draw_path_find_' + levelId)

                path2.setAttribute('class', 'anim_render_draw_path')
                path2.setAttribute('stroke-dasharray', 4)


                let markerpathStr = "M 0.988281 3.230469 C 0.480469 3.488281 0.5 3.558594 2.039062 7.1875 C 2.828125 9.039062 3.46875 10.585938 3.46875 10.632812 C 3.46875 10.675781 2.828125 12.222656 2.046875 14.066406 C 1.261719 15.90625 0.621094 17.472656 0.621094 17.542969 C 0.621094 17.75 0.871094 18.035156 1.101562 18.097656 C 1.273438 18.140625 3.550781 17.277344 10.070312 14.714844 C 14.882812 12.828125 18.921875 11.226562 19.046875 11.15625 C 19.332031 11.015625 19.429688 10.683594 19.296875 10.375 C 19.179688 10.125 19.441406 10.230469 13.878906 8.050781 C 9.492188 6.324219 8.585938 5.96875 4.464844 4.351562 C 2.738281 3.675781 1.300781 3.113281 1.261719 3.113281 C 1.226562 3.113281 1.101562 3.167969 0.988281 3.230469 Z M 0.988281 3.230469 ";
                let marker = document.createElement('path');
                marker.setAttribute('d', markerpathStr)
                marker.setAttribute('style', 'stroke:none;fill-rule:nonzero;fill:rgb(255%,0%,0%);fill-opacity:1;')
                marker.setAttribute('class', 'draw_triangle');




                let g = document.createElement('g');
                g.setAttribute('id', 'path_find_' + levelId)
                g.appendChild(path);
                g.appendChild(path2);
                g.appendChild(marker);

                let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id=' + levelId + ']')];
                if (placeElem[0])
                    levelElem[0].parentNode.insertBefore(g, placeElem[0].nextSibling);
                else
                    levelElem[0].parentNode.appendChild(g);

                console.log('-- foundPath[i] : ', foundPath[i]);
                console.log('-- foundPath[i+1] : ', foundPath[i + 1]);

                this._addPlaceCircle(foundPath[i + 1].data, 'connection')
                this._addPlaceCircle(foundPath[i].data, 'connection')


                // set new level
                levelId = foundPath[i].data.levelId;
                pathStr = 'M' + foundPath[i].data.absX.toFixed(3) + ' ' + +foundPath[i].data.absY.toFixed(3) + ' L'
            }
        }

        // add path to previous level
        let levelElem = [...svg.querySelectorAll('g[id=' + levelId + ']')];
        let path = document.createElement('path');
        path.setAttribute('d', pathStr)
        path.setAttribute('stroke', 'rgba(240,10,0,1)')
        path.setAttribute('stroke-width', 3)
        path.setAttribute('fill', 'none')
        path.setAttribute('id', 'draw_path_find_' + levelId)

        path.setAttribute('class', 'render_draw_path')
        path.setAttribute('stroke-dasharray', 4)


        let path2 = document.createElement('path');
        path2.setAttribute('d', pathStr)
        path2.setAttribute('stroke', 'rgba(250,0,0,1)')
        path2.setAttribute('stroke-width', 4)
        path2.setAttribute('fill', 'none')
        path2.setAttribute('id', 'anim_draw_path_find_' + levelId)

        path2.setAttribute('class', 'anim_render_draw_path')
        path2.setAttribute('stroke-dasharray', 4)


        let markerpathStr = "M 0.988281 3.230469 C 0.480469 3.488281 0.5 3.558594 2.039062 7.1875 C 2.828125 9.039062 3.46875 10.585938 3.46875 10.632812 C 3.46875 10.675781 2.828125 12.222656 2.046875 14.066406 C 1.261719 15.90625 0.621094 17.472656 0.621094 17.542969 C 0.621094 17.75 0.871094 18.035156 1.101562 18.097656 C 1.273438 18.140625 3.550781 17.277344 10.070312 14.714844 C 14.882812 12.828125 18.921875 11.226562 19.046875 11.15625 C 19.332031 11.015625 19.429688 10.683594 19.296875 10.375 C 19.179688 10.125 19.441406 10.230469 13.878906 8.050781 C 9.492188 6.324219 8.585938 5.96875 4.464844 4.351562 C 2.738281 3.675781 1.300781 3.113281 1.261719 3.113281 C 1.226562 3.113281 1.101562 3.167969 0.988281 3.230469 Z M 0.988281 3.230469 ";
        let marker = document.createElement('path');
        marker.setAttribute('d', markerpathStr)
        marker.setAttribute('style', 'stroke:none;fill-rule:nonzero;fill:rgb(255%,0%,0%);fill-opacity:1;')
        marker.setAttribute('class', 'draw_triangle');


        let g = document.createElement('g');
        g.setAttribute('id', 'path_find_' + levelId)
        g.appendChild(path);
        g.appendChild(path2);
        g.appendChild(marker);

        let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id=' + levelId + ']')];
        if (placeElem[0])
            levelElem[0].parentNode.insertBefore(g, placeElem[0].nextSibling);
        else
            levelElem[0].parentNode.appendChild(g);


        this._refreshMap()

        for (var i = foundPath.length - 2; i >= 1; i--) {
            let connection = foundPath[i].data;
            let prevConnection = foundPath[i - 1].data;
            let nextConnection = foundPath[i + 1].data;

            if (CONNECTIONS_TYPES.includes(connection.type)) {
                let temp = [...svg.querySelectorAll('g[id=connection_' + connection.id + ']')];
                if (temp[0]) {
                    if (CONNECTIONS_TYPES.includes(nextConnection.type))
                        temp[0].addEventListener("click", this.onConnectionMouseClick.bind(this, connection, nextConnection.levelId), false);
                    else if (CONNECTIONS_TYPES.includes(prevConnection.type))
                        temp[0].addEventListener("click", this.onConnectionMouseClick.bind(this, connection, prevConnection.levelId), false);
                }
            }
        }


        let path_finder_id = "#draw_path_find_" + levelId;
        let _path = document.querySelector(path_finder_id);
        if(_path == null){
            console.log(' the path null:',_path);
            return;
        }

        let length = _path.getTotalLength();
        console.log(' the path length:',length);

        if(length === 0){
            let triangles =  document.querySelectorAll('.draw_triangle');
            for(let triangle of triangles){
                triangle.setAttribute('visibility','hidden');
            }
            return;
        }else{
            let triangles =  document.querySelectorAll('.draw_triangle');
            for(let triangle of triangles){
                triangle.setAttribute('visibility','visible');
            }
        }


        if(tween){
            tween.kill();
            tween = null;
        }




        // register the plugin
        gsap.registerPlugin(MotionPathPlugin);

// set the element to rotate from it's center
        gsap.set([".draw_triangle", ".draw_triangle--self"], {
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "50% 50%"
        });

// animate the rocket along the path

        let animTime =  Math.floor(length/Path_AnimationSpeed);
        console.log('path_finder_id',path_finder_id)
         tween = gsap.to(".draw_triangle", {
            motionPath: {
                path: path_finder_id,
                align: path_finder_id,
                autoRotate: true,
            },
            onUpdate:this.updateFunction,
            onUpdateParams:[levelId,this],
            duration: animTime,
            repeat: -1,
            // ease: "power1.inOut",
            ease: Linear.easeNone,
            immediateRender: true,
        });
    }



    updateFunction(levelId,self)
    {
        if( tween ){
            let tweenprogress = tween.progress();
            // console.log( 'tweenProgress after',tweenprogress)
            let path_finder_id = "#draw_path_find_" + levelId;
            let _path =  document.querySelector(path_finder_id);
            if(_path == null){
                return;
            }
            let rawPath = MotionPathPlugin.getRawPath(path_finder_id),
                point;
            let  resolution = 12;
            MotionPathPlugin.cacheRawPathMeasurements(rawPath,resolution);
            point = MotionPathPlugin.getPositionOnPath(rawPath, tweenprogress, true);




            let angle = point.angle;
            if(prevAlpha != angle){
                console.log('get points',point,prevAlpha)

                if(Math.abs(prevAlpha-angle) > 5){
                    self.getNearestPlace(point);
                    prevAlpha = angle;
                }
            }


            let anim_path_finder_id = "#anim_draw_path_find_" + levelId;
            let _anim_path = document.querySelector(anim_path_finder_id);
            if(_anim_path == null){
                console.log(' the path null:',_anim_path);
                return;
            }
            var pathLength = _anim_path.getTotalLength();
            var anim_length = pathLength * tweenprogress;

            _anim_path.style.strokeDasharray = [anim_length,pathLength].join(' ');

        }
    }

    getNearestPlace = (point) => {
        let pointX = point.x;
        let pointY = point.y;
        let {graph, map, svg,curLevelIdx ,toPlace} = this.state;
        if(curLevelIdx === undefined){
            return;
        }

        if (svg && map && map.mapData && map.mapData.levels && map.mapData.levels.length > 0) {
            let levels = map.mapData.levels;
            let level = levels[curLevelIdx];
            let levelElem = [...svg.querySelectorAll('g[id=level' + curLevelIdx + ']')];
            let places = level.places;

            if (places && places.length > 0) {

                let nearPlaces = [];
                for (var j = 0; j < places.length; j++) {
                    let place = places[j];
                    if(PLACES_TYPES.includes(place.type)){
                        let absX = place.absX;
                        let absY = place.absY;
                        let dx = absX - pointX;
                        let dy = absY - pointY;
                        let dist2= dx * dx + dy * dy;
                        nearPlaces.push({
                            place:place,
                            dist:dist2
                        })
                    }
                }

                if(nearPlaces.length>0){
                    let target = nearPlaces[0];
                    for(let j=1;j<nearPlaces.length;j++){
                        if(nearPlaces[j].dist<target.dist){
                            target = nearPlaces[j];
                        }
                    }
                    // console.log('the nearest place:',target.place)
                    console.log('the nearest place:',target.place.name,target.place.id)

                    let name = target.place.name;
                    let id = target.place.type +  ' ' + target.place.id;
                    let showName  = (name === undefined || name === "") ? id:name;
                    console.log('the nearest place name:',showName);

                    let angle = point.angle;

                    this.getArrowString(prevAlpha,angle,showName);

                    if(toPlace != null && toPlace.id === target.place.id){
                        this.arrowStr = "";
                    }

                    console.log(this.arrowStr)

                    let showArrow = document.getElementById('show_direction_label_anim');
                    showArrow.classList.remove('elementToFadeInAndOut');
                    showArrow.classList.add('elementToFadeInAndOut');
                    showArrow.innerText=this.arrowStr;

                    if(animTimer){
                        clearTimeout(animTimer);
                    }

                    let that = this;

                     animTimer = setTimeout(function () {
                        let showArrow = document.getElementById('show_direction_label_anim');
                        if(showArrow){
                            showArrow.classList.remove('elementToFadeInAndOut');
                        }
                        if(animTimer){
                            clearTimeout(animTimer);
                        }
                    }, 2000)


                }
            }
        }
    }

    getArrowString = (prevAlpha,angle,placeName) => {

        console.log('getArrowString',prevAlpha,angle);

        if(prevAlpha >= 0 && prevAlpha <= 90){

            if(angle >= 0 && angle <= 90){
                if(prevAlpha>angle){
                    this.arrowStr = 'Turn left at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right at the ' + placeName;
                }

            }else if(angle >= 90 && angle <= 180){
                this.arrowStr = 'Turn right at the  ' + placeName;

            }else if (angle <= 0 && angle >= -90){
                this.arrowStr = 'Turn left at the ' + placeName;

            }else if (angle <= -90 && angle >= -180){
                let otherangle = prevAlpha - 180;

                if(angle > otherangle){
                    this.arrowStr = 'Turn left  back at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right back at the ' + placeName;
                }
            }

        }else if(prevAlpha >= 90 && prevAlpha <= 180){

            if(angle >= 0 && angle <= 90){

                this.arrowStr = 'Turn left  at the  ' + placeName;

            }else if(angle >= 90 && angle <= 180){

                if(prevAlpha>angle){
                    this.arrowStr = 'Turn left  at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right  at the ' + placeName;
                }


            }else if (angle <= 0 && angle >= -90){

                let otherangle = prevAlpha - 180;

                if(angle > otherangle){
                    this.arrowStr = 'Turn left back at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right back at the ' + placeName;
                }

            }else if (angle <= -90 && angle >= -180){

                this.arrowStr = 'Turn right at the ' + placeName;
            }

        }else if (prevAlpha <= 0 && prevAlpha >= -90){

            if(angle >= 0 && angle <= 90){

                this.arrowStr = 'Turn right  at the  ' + placeName;

            }else if(angle >= 90 && angle <= 180){

                let otherangle = prevAlpha + 180;

                if(angle > otherangle){
                    this.arrowStr = 'Turn left back at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right back at the ' + placeName;
                }


            }else if (angle <= 0 && angle >= -90){

                if(angle > prevAlpha){
                    this.arrowStr = 'Turn right  at the  ' + placeName;
                }else{
                    this.rrowStr = 'Turn left  at the ' + placeName;
                }

            }else if (angle <= -90 && angle >= -180){

                this.arrowStr = 'Turn left at the ' + placeName;
            }


        }else if (prevAlpha <= -90 && prevAlpha >= -180){

            if(angle >= 0 && angle <= 90){

                let otherangle = prevAlpha + 180;

                if(angle > otherangle){
                    this.arrowStr = 'Turn left back at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn right back at the ' + placeName;
                }

            }else if(angle >= 90 && angle <= 180){

                this.arrowStr = 'Turn left  at the ' + placeName;

            }else if (angle <= 0 && angle >= -90){

                this.arrowStr = 'Turn right at the  ' + placeName;

            }else if (angle <= -90 && angle >= -180){

                if(angle > prevAlpha){
                    this.arrowStr = 'Turn right a bit at the  ' + placeName;
                }else{
                    this.arrowStr = 'Turn left a bit  at the ' + placeName;
                }
            }
        }
    }

    anchorsToProgress(rawPath, resolution) {
        resolution = ~~resolution || 12;
        if (!Array.isArray(rawPath)) {
            rawPath = MotionPathPlugin.getRawPath(rawPath);
        }
        MotionPathPlugin.cacheRawPathMeasurements(rawPath, resolution);
        let progress = [0],
            length, s, i, e, segment, samples;
        for (s = 0; s < rawPath.length; s++) {
            segment = rawPath[s];
            samples = segment.samples;
            e = segment.length - 6;
            for (i = 0; i < e; i+=6) {
                length = samples[(i / 6 + 1) * resolution - 1];
                progress.push(length / rawPath.totalLength);
            }
        }
        return progress;
    }


    onConnectionMouseClick = async (connection, levelId, event) => {
        let curLevelIdx = levelId;
        curLevelIdx = parseInt(curLevelIdx.replace('level', ''));
        this.setState({
            curLevelIdx: curLevelIdx
        })

        let that = this
        setTimeout(function () {
            that.onSelectLevel(curLevelIdx);
        }, 10)

    }


    _calcInteractionPos(levelId, place) {
        let {map, curLevelIdx} = this.state;

        if (place.direction === '' || place.direction === undefined) return null;

        let direction = this._getDirectionData(map, levelId, place.direction)

        if( direction == null ) {
            console.log('_calcInteractionPos: the direction is null:')
            return null;
        }

        let placeA = this._getPlaceData(map, levelId, direction.placeA)
        let placeB = this._getPlaceData(map, levelId, direction.placeB)

        let x1 = placeA.absX, y1 = placeA.absY
        let x2 = placeB.absX, y2 = placeB.absY
        let x3 = place.absX, y3 = place.absY
        let dX = x2 - x1, dY = y2 - y1
        let m = dY / dX

        let x4 = (y3 - y1 + m * x1 + 1 / m * x3) / (m + 1 / m)
        let y4 = m * (x4 - x1) + y1

        return {x: x4, y: y4}

    }

    _renderFinalPath(place) {
        let {svg, map, curLevelIdx, curPlaceId} = this.state;
        if (place.direction === '' || place.direction === undefined) return null;

        let levels = map.mapData.levels
        let curLevel = levels[curLevelIdx];
        let direction = this._getDirectionData(map, curLevel.id, place.direction)
        let levelElem = [...svg.querySelectorAll('g[id=' + curLevel.id + ']')];
        let interactionPos = this._calcInteractionPos(curLevel.id, place)

        if (interactionPos) {
            let finalPath = document.createElement('line');
            finalPath.setAttribute('x1', place.absX)
            finalPath.setAttribute('y1', place.absY)
            finalPath.setAttribute('x2', interactionPos.x)
            finalPath.setAttribute('y2', interactionPos.y)
            finalPath.setAttribute('style', 'stroke:' + FINALPATH_BACKGROUND_COLOR + ';stroke-width:' + FINALPATH_STROKE_WIDTH)

            let g = document.createElement('g');
            g.setAttribute('id', 'final_' + place.direction + '__' + place.id)
            g.appendChild(finalPath);

            let placeElem = [...levelElem[0].parentNode.querySelectorAll('g[id^=place_]')];
            if (placeElem[0])
                levelElem[0].parentNode.insertBefore(g, placeElem[0]);
            else
                levelElem[0].parentNode.appendChild(g);
        }
    }

    onMapScaleChange = (event) => {

        console.log('OnMapScaleChange', event.target.value);
        console.log('OnMapScaleChange props', this.props.map_scale);
        this.props.onScaleChange(event.target.value)
    }

    onRotateChange = (event) => {

        var rotate =   event.target.value;
        console.log('onMapRotateChange', rotate);

        if(!isNaN(rotate)){
            rotate = rotate % 180;
            this.mapRotate(rotate);
        }

    }

    render() {
        let {curLevelIdx, map, isFindPath} = this.state;
        let levels = [];
        let places = [];
        if (map.mapData && map.mapData.levels) {
            levels = map.mapData.levels;
            for (var i = 0; i < levels.length; i++) {
                places.push(...levels[i].places);
            }
        }
        let levelsArr = [];

        for (let i = 0; i < levels.length; i++) {
            let level = levels[i];
            levelsArr.push(
                <a
                    style={{
                        ...styles.levelBtn,
                        backgroundColor: curLevelIdx === i ? '#333' : '#fff',
                        color: curLevelIdx === i ? '#fff' : '#333',
                    }}
                    onClick={this.onSelectLevel.bind(this, i)}
                    className="levelBtn"
                    key={'levelbtn-' + level.id}
                >
                    {level.name}
                </a>
            )
        }


        return (
            <div>
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
                        {<style dangerouslySetInnerHTML={{
                            __html: `
                              #path_find {
                                stroke-dasharray: 1000;
                                stroke-dashoffset: 1000;
                                animation: dash 10s linear forwards;
                              }
                              
                              @keyframes dash {
                                to {
                                  stroke-dashoffset: 0;
                                }
                              }
                            `
                        }}/>}
                        {map.mapSVG && <ReactSVG
                            src={map.mapSVG}
                            beforeInjection={this.loadSVG}
                        />}
                    </div>

                    {/* level pannel */}
                    <div style={styles.levelPannel}>
                        {levelsArr}
                    </div>

                    <div style={styles.estimatePannel}>
                        <FormGroup>
                            <Label id={'show_direction_label_anim'} className={'unVisible'} style={{color:'red'}}></Label>
                        </FormGroup>


                        <FormGroup>
                            <Label>Map Rotate</Label>
                            <Input type="number" style={{backgroundColor: 'transparent'}} placeholder="Map Rotate"
                                          defaultValue={this.state.map_rotate} maxLength="360"
                                          onChange={this.onRotateChange.bind(this)}/>
                        </FormGroup>

                        {
                            this.state.totalTime !== 0 && (
                                <div>
                                    <Label style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>Total Time  <Label>{this.state.totalTimeStr}</Label></Label>
                                    <Label style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>Total Dist   <Label>{this.state.totalDist} M</Label></Label>
                                </div>
                            )
                        }

                    </div>

                    {/* search pannel */}

                    <div style={styles.searchPannel}>
                        <MapViewerSearchPannel
                            places={places}
                            check={{
                                stair: this.state.stair_check,
                                elevator: this.state.elevator_check,
                                escalator: this.state.escalator_check,
                                searchOption: this.state.routeSearchOption,
                            }}
                            searchOption={this.state.routeSearchOption}
                            onRadioChange={this.onRouteOptionChange}
                            onSearchPlaces={this.onSearchPlaces}
                            onCheckChange={this.onCheckChange}
                            currentPostion={this.state.fromPlace}
                        />
                    </div>
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
    mapPannel: {},
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
    estimatePannel: {
        flexDirection: 'column',
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginRight: 5,
        marginBottom: 5,
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
    searchPannel: {
        position: 'absolute',
        left: 0,
        top: 0,
        border: '1px solid #999',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#fff'
    },
    radioOptionLabel: {
        marginLeft: 5
    },

}

const specialStyles = `
.placesElemHeaderLink:hover {
  background-color: #eee
}
`
