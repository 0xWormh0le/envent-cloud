import React, { useState } from 'react';
import { ReactSVG } from 'react-svg'
import {
  Input,
  Row,
  Col,
  Button,
  Nav,
  Card,
  Form,
  ButtonGroup,
  Dropdown,
  Container,
  CardBody,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  ButtonToolbar
} from 'reactstrap';

import Switch from "react-switch";
import AccordionCollapseComponent from "../CustomCollapse";

const MAP_EDITOR_WIDTH = '100%'
const MAP_EDITOR_HEIGHT = 675




export default class MapEditorDirectionsPannel extends React.Component {

  elemRefArr = [];

  constructor(props) {
    super(props);

    this.state = {
      directions: this.props.directions,
      curLevelIdx: this.props.curLevelIdx,
      curDirectionId: this.props.curDirectionId,
    };

    this.onDirectionStatus = this.onDirectionStatus.bind(this)
  }




  componentWillReceiveProps(nextProps){
    let directionsJSON = JSON.stringify(this.state.directions);
    let newDirectionsJSON = JSON.stringify(nextProps.directions);
    if( directionsJSON !== newDirectionsJSON ||
      this.state.curLevelIdx !== nextProps.curLevelIdx ||
      this.state.curDirectionId !== nextProps.curDirectionId
    ){
      console.log('-- MapEditorDirectionsPannel componentWillReceiveProps');
      this.elemRefArr = [];
      this.setState({
        directions: nextProps.directions,
        curLevelIdx: nextProps.curLevelIdx,
        curDirectionId: nextProps.curDirectionId
      })

      var that = this;

      // scroll to selected directions
      setTimeout(function(){
        for( var i=0; i<that.elemRefArr.length; i++ ){
          if( that.elemRefArr[i].directionId == that.state.curDirectionId ){
            if( that.elemRefArr[i].ref ){
              let curScrollPos = that.scrollRef.scrollTop;
              let scrollOffset = that.elemRefArr[i].ref.getBoundingClientRect().top
              that.scrollRef.scrollTo(0, curScrollPos + scrollOffset - that.scrollRef.getBoundingClientRect().top);
            }
          }
        }
      }, 10)
    }
  }





  onDirectionClick = (directionId, e) => {
    this.props.onDirectionClick( directionId )
    if(this.state.curDirectionId === directionId){
      this.setState({
        curDirectionId: '',
      })
    }else{
      this.setState({
        curDirectionId: directionId,
      })
    }
  }


  onDirectionStatus = (direction, status) => {
    console.log('-- status : ', status)
    this.props.onDirectionStatus( direction, status );
  }


  onDeleteDirection = (direction) => {
    console.log('-- direction : ', direction)
    this.props.onDeleteDirection(direction)
  }


  render() {
    let {directions, curDirectionId} = this.state;
    let directionsArr = [];


    if( directions && directions.length > 0 ){
      for( var i=0; i<directions.length; i++ ){
        let direction = directions[i];

        directionsArr.push(
          <div key={'directioncard-' + direction.id}>
            <AccordionCollapseComponent
                title={'s'}
                className="boxed"
                activeId={curDirectionId}
                selfId={direction.id}
                toggle={this.onDirectionClick.bind(this, direction.id)}
                header= {
                  <div
                      ref={(ref)=>{
                        for( var i=0; i<this.elemRefArr.length; i++ ){
                          if( this.elemRefArr[i].directionId == direction.id ) {
                            this.elemRefArr[i].ref = ref;
                            return;
                          }
                        }
                        this.elemRefArr.push({
                          directionId: direction.id,
                          ref: ref
                        })
                      }}
                  >
                    <span style={{color: '#007bff'}}>{direction.id}</span>
                    <span style={styles.directionsElemHeaderLinkStatus}>
                      <Switch onChange={this.onDirectionStatus.bind(this, direction)} checked={direction.status} height={16} width={32} checkedIcon={false} uncheckedIcon={false}/>
                    </span>
                  </div>
                }>
              <form className="form">
                <div className="form__form-group">
                  <span className="form__form-group-label">ID</span>
                  <div className="form__form-group-field">
                    <Input
                        name="defaultInput"
                        component="input"
                        type="text"
                        value={direction.id}
                        placeholder=""
                        readonly

                    />
                  </div>
                </div>
              </form>
              <div style={{marginTop: 10}}>
                <Button color="danger"  size={"sm"} onClick={this.onDeleteDirection.bind(this, direction)} block>Delete</Button>
              </div>
            </AccordionCollapseComponent>


          </div>
        )
      }
    }

    return (
      <div style={styles.directionsPannel}>
        <div style={styles.directionsPannelTitle}>
          <h3 style={styles.directionsPannelTitleText}>{this.props.title}</h3>
        </div>
        <div style={styles.directionsPannelContent} ref={(ref)=>{this.scrollRef = ref}}>
          <style dangerouslySetInnerHTML={{__html: `
            .directionsElemHeaderLink:hover {
              background-color: #eee
            }
          `}}/>
          <div activeKey={curDirectionId}>
            {directionsArr}
          </div>
        </div>

      </div>
    )
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
  directionsPannel: {

  },
  directionsPannelTitle: {
    padding: '5px 10px',
    marginBottom: 10,
    backgroundColor: '#333',
    borderBottom: '1px solid #ccc'
  },
  directionsPannelTitleText: {
    display: 'inline-block',
    color: '#fff',
    fontSize: 18,
    lineHeight: 2,
    margin: 0,
    verticalAlign: 'middle'
  },
  directionsPannelContent: {
    padding: 10,
    height: MAP_EDITOR_HEIGHT-50,
    overflow: 'auto'
  },
  directionsElemHeader: {
    padding: 0
  },
  directionsElemHeaderLink: {
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
  directionsElemHeaderLinkStatus: {
    width: 32,
    height: 16,
    float: 'right',
    borderRadius: 6,
    marginTop: 4
  },
}

const specialStyles = `
.directionsElemHeaderLink:hover {
  background-color: #eee
}
`
