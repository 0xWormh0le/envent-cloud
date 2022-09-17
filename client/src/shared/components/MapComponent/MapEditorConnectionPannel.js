import React, {useState} from 'react';
import {ReactSVG} from 'react-svg'
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
import {CONNECTIONS_TYPES} from './MapEditor'
import {REAL_CONNECTIONS_TYPES} from './MapEditor'
import Collapse from '../Collapse';
import AccordionCollapseComponent from "../CustomCollapse";

import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import {Field, reduxForm} from 'redux-form';


import {FormControlLabel, FormGroup, FormControl, FormLabel} from '@material-ui/core';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';


const MAP_EDITOR_WIDTH = '100%'
const MAP_EDITOR_HEIGHT = 675


const CustomMenu = React.forwardRef(
    ({children, style, className, 'aria-labelledby': labeledBy}, ref) => {
        const [value, setValue] = useState('');

        return (
            <div
                ref={ref}
                style={{
                    ...style,
                    position: 'relative',
                    transform: 'none',
                    width: '100%',
                    height: 200,
                    overflow: 'auto',
                    marginBottom: 20
                }}
                className={className}
                aria-labelledby={labeledBy}
            >
                {children}
            </div>
        );
    },
);


class MapEditorConnectionPannel extends React.Component {

    elemRefArr = [];

    constructor(props) {
        super(props);

        this.state = {
            places: this.props.places,
            curLevelIdx: this.props.curLevelIdx,
            curPlaceId: this.props.curPlaceId,
            linkConnections: this.props.linkConnections,
            time: 1,
        };

        this.onPlaceStatus = this.onPlaceStatus.bind(this)
    }


    componentWillReceiveProps(nextProps) {
        let placesJSON = JSON.stringify(this.state.places);
        let newPlacesJSON = JSON.stringify(nextProps.places);
        if (placesJSON !== newPlacesJSON ||
            this.state.curLevelIdx !== nextProps.curLevelIdx ||
            this.state.curPlaceId !== nextProps.curPlaceId
        ) {
            console.log('-- MapEditorPlacesPannel componentWillReceiveProps linkConnections : ', nextProps.linkConnections);
            this.elemRefArr = [];
            this.setState({
                places: nextProps.places,
                curLevelIdx: nextProps.curLevelIdx,
                curPlaceId: nextProps.curPlaceId,
                isPickDirection: false,
                linkConnections: nextProps.linkConnections
            })

            var that = this;

            // scroll to selected places
            setTimeout(function () {
                for (var i = 0; i < that.elemRefArr.length; i++) {
                    if (that.elemRefArr[i].placeId == that.state.curPlaceId) {
                        if (that.elemRefArr[i].ref) {
                            let curScrollPos = that.scrollRef.scrollTop;
                            let scrollOffset = that.elemRefArr[i].ref.getBoundingClientRect().top
                            that.scrollRef.scrollTo(0, curScrollPos + scrollOffset - that.scrollRef.getBoundingClientRect().top);
                        }
                    }
                }
            }, 10)
        }
    }


    onPlaceClick = (placeId, e) => {
        this.props.onPlaceClick(placeId)
        if (this.state.curPlaceId === placeId) {
            this.setState({
                curPlaceId: '',
            })
        } else {
            this.setState({
                curPlaceId: placeId,
            })
        }

    }


    onPlaceName = (place, event) => {
        this.props.onPlaceName(place, event.currentTarget.value);
    }


    onPlaceStatus = (place, status) => {
        console.log('-- status : ', status)
        this.props.onPlaceStatus(place, status);
    }

    onWheelchairCheck = (place, status) => {
        console.log('-- status : ', status)
        this.props.onWheelchairCheckChange(place, status);
    }


    onTypeSelect = (place, event) => {
        this.props.onPlaceType(place, event.target.value)
    }


    onConnectionSelect = (place, event) => {
        console.log('onConnectionSelect:', place, event.target)
        this.props.onPlaceConnection(place, event.target.value)
    }

    onConnectionTimeChange = (place, event) => {
        this.props.onConnectionTime(place, event.target.value)
    }

    onStairDistChange = (place, event) => {
        this.props.onStairDistChange(place, event.target.value)
    }

    onDeletePlace = (place) => {
        console.log('-- place : ', place)
        if (place.fillId != '') {
            alert('You can only delete place you added.');
            return;
        }
        this.props.onDeletePlace(place)
    }


    onPickDirection = (place) => {
        this.setState({
            isPickDirection: !this.state.isPickDirection
        })
        this.props.onPickDirection(place, !this.state.isPickDirection)
    }

    handleChange(event) {
        const value = event.target.value.replace(/\+|-/ig, '');
        console.log('the handle change input', value, this.state.time)
        this.setState({time: value});
    }


    renderTypeDropdown(place) {
        let dropdownItemsArr = [];
        for (var i = 0; i < CONNECTIONS_TYPES.length; i++) {
            let typeName = CONNECTIONS_TYPES[i].charAt(0).toUpperCase() + CONNECTIONS_TYPES[i].slice(1);
            dropdownItemsArr.push(
                <DropdownItem as="button" value={CONNECTIONS_TYPES[i]}
                              onClick={this.onTypeSelect.bind(this, place)}
                              key={'typedropitem_' + i + '_' + place.id}>{typeName}</DropdownItem>
            )
        }

        let placeTypeName = place.type.charAt(0).toUpperCase() + place.type.slice(1)
        return (
            <UncontrolledDropdown>
                <ButtonGroup dir="ltr">
                    <DropdownToggle color="primary" className="icon icon--right">
                        <p>{placeTypeName} <ChevronDownIcon/></p>
                    </DropdownToggle>
                </ButtonGroup>
                <DropdownMenu right className="dropdown__menu">
                    {dropdownItemsArr}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }


    renderConnectionDropdown(place) {

        console.log('renderconnection:', place);
        let {linkConnections} = this.state;
        if (linkConnections == undefined) return;

        let dropdownItemsArr = [];

        let selConnectionName = '';
        for (var i = 0; i < linkConnections.length; i++) {
            let connectionName = linkConnections[i].name != '' ? linkConnections[i].name : linkConnections[i].id;
            dropdownItemsArr.push(
                <DropdownItem as="button"
                              value={linkConnections[i].id}
                              onClick={this.onConnectionSelect.bind(this, place)}
                              name={'connectiondropitem_' + i + '_' + place.id}>{connectionName}</DropdownItem>
            )

            if (linkConnections[i].id == place.connection)
                selConnectionName = connectionName
        }

        return (
            <UncontrolledDropdown>
                <ButtonGroup dir="ltr">
                    <DropdownToggle color="primary" className="icon icon--right">
                        <p>{selConnectionName} <ChevronDownIcon/></p>
                    </DropdownToggle>
                </ButtonGroup>
                <DropdownMenu right className="dropdown__menu">
                    {dropdownItemsArr}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }


    render() {
        let {places, curPlaceId, isPickDirection, linkConnections} = this.state;
        let placesArr = [];

        if (places && places.length > 0) {
            for (var i = 0; i < places.length; i++) {
                let place = places[i];
                let placeTypeName = place.type.charAt(0).toUpperCase() + place.type.slice(1)

                placesArr.push(
                    <div key={'placecard-' + place.id}>
                        <AccordionCollapseComponent
                            title="op"
                            className="boxed"
                            activeId={curPlaceId}
                            selfId={place.id}
                            toggle={this.onPlaceClick.bind(this, place.id)}
                            header={
                                <div
                                    ref={(ref) => {
                                        for (var i = 0; i < this.elemRefArr.length; i++) {
                                            if (this.elemRefArr[i].placeId == place.id) {
                                                this.elemRefArr[i].ref = ref;
                                                return;
                                            }
                                        }
                                        this.elemRefArr.push({
                                            placeId: place.id,
                                            ref: ref
                                        })
                                    }}
                                >
                                    <span
                                        style={{color: place.name !== '' ? '#007bff' : '#ccc'}}>{place.name !== '' ? place.name : place.id}</span>
                                    <span style={styles.placesElemHeaderLinkStatus}>
                                      <Switch onChange={this.onPlaceStatus.bind(this, place)} checked={place.status}
                                              height={16}
                                              width={32} checkedIcon={false} uncheckedIcon={false}/>
                                    </span>
                                </div>
                            }>

                            <form className="form" style={styles.addModal}>
                                <div className="form__form-group">
                                    <span className="form__form-group-label">ID</span>
                                    <div className="form__form-group-field">
                                        <Input
                                            name="defaultInput"
                                            component="input"
                                            type="text"
                                            value={place.id}
                                            placeholder=""
                                            readonly

                                        />
                                    </div>
                                </div>

                                <div className="form__form-group">
                                    <span className="form__form-group-label">Name</span>
                                    <div className="form__form-group-field">
                                        <Input
                                            name="defaultInput"
                                            type="text"
                                            value={place.name}
                                            placeholder="Place Name"
                                            onChange={this.onPlaceName.bind(this, place)}
                                        />
                                    </div>
                                </div>

                                <span className="form__form-group-label  flex-fill">Location</span>
                                <Row style={{margin: 0}}>
                                    <Col sm="2" style={{padding: '0 10px 0 0', textAlign: 'right'}}>x: </Col>
                                    <Col sm="4" style={{padding: 0}}>

                                        <div className="form__form-group-field">
                                            <Input
                                                name="defaultInput"
                                                component="input"
                                                value={place.absX}
                                                placeholder=""
                                                readonly
                                            />
                                        </div>
                                    </Col>
                                    <Col sm="2" style={{padding: '0 10px 0 0', textAlign: 'right'}}>y: </Col>
                                    <Col sm="4" style={{padding: 0}}>

                                        <div className="form__form-group-field">
                                            <Input
                                                name="defaultInput"
                                                component="input"
                                                value={place.absY}
                                                placeholder=""
                                                readonly
                                            />
                                        </div>

                                    </Col>
                                </Row>
                                {
                                    REAL_CONNECTIONS_TYPES.includes(place.type) && (

                                        <div className="form__form-group">
                                            <span className="form__form-group-label">Time</span>
                                            <div className="form__form-group-field">
                                                <Input
                                                    name="defaultInput"
                                                    component="input"
                                                    type="number"
                                                    value={place.time}
                                                    placeholder="Estimated Time"
                                                    onChange={this.onConnectionTimeChange.bind(this, place)}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    place.type === 'stair' && (
                                        <div className="form__form-group">
                                            <span className="form__form-group-label">Stair Height</span>
                                            <div className="form__form-group-field">
                                                <Input
                                                    name="defaultInput"
                                                    component="input"
                                                    type="number"
                                                    value={place.stairDist}
                                                    placeholder="Estimated Stair Height"
                                                    onChange={this.onStairDistChange.bind(this, place)}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    place.type === 'escalator' && (
                                        <div>
                                            <span
                                                className="form__form-group-label d-block">Wheelchair Accessible</span>
                                            <Switch onChange={this.onWheelchairCheck.bind(this, place)}
                                                    checked={place.isWheelchair}
                                                    height={16} width={32} checkedIcon={false}
                                                    uncheckedIcon={false}/>

                                            {/*<span style={styles.placesElemHeaderLinkStatus}>*/}
                                            {/*      <Switch onChange={this.onWheelchairCheck.bind(this, place)}*/}
                                            {/*              checked={place.isWheelchair}*/}
                                            {/*              height={16} width={32} checkedIcon={false}*/}
                                            {/*              uncheckedIcon={false}/>*/}
                                            {/*    </span>*/}
                                        </div>
                                    )
                                }
                                <div className="d-block">
                                    <span className="form__form-group-label d-block">Type</span>
                                    {this.renderTypeDropdown(place)}
                                </div>


                                {linkConnections && linkConnections.length > 0 && <div className="d-block">
                                    <span className="form__form-group-label d-block">Linked Connection</span>
                                    {this.renderConnectionDropdown(place)}
                                </div>}

                                <div className="d-block">
                                    <span className="form__form-group-label d-block">Linked Direction</span>
                                    <Button
                                        size={'sm'}
                                        block={true}
                                        color={isPickDirection ? 'success' : place.direction != '' ? 'primary' : 'light'}
                                        onClick={this.onPickDirection.bind(this, place)}
                                        style={{border: isPickDirection ? 'none' : '1px solid #ddd'}}
                                    >
                                        {isPickDirection != '' ? 'Picking Now...' : place.direction ? place.direction : 'Pick Direction'}
                                    </Button>
                                </div>


                            </form>

                            <div style={{marginTop: 10}}>
                                <Button color="danger" size="sm"
                                        onClick={this.onDeletePlace.bind(this, place)} block>Delete</Button>
                            </div>

                        </AccordionCollapseComponent>
                    </div>
                )
            }
        }

        return (
            <div style={styles.placesPannel}>
                <div style={styles.placesPannelTitle}>
                    <h3 style={styles.placesPannelTitleText}>{this.props.title}</h3>
                </div>
                <div style={styles.placesPannelContent} ref={(ref) => {
                    this.scrollRef = ref
                }}>
                    <style dangerouslySetInnerHTML={{
                        __html: `
            .placesElemHeaderLink:hover {
              background-color: #eee
            }
          `
                    }}/>
                    <div activeKey={curPlaceId}>
                        {placesArr}
                    </div>
                </div>

            </div>
        )
    }
}

export default reduxForm({
    form: 'vertical_form', // a unique identifier for this form
})(withTranslation('common')(MapEditorConnectionPannel));

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
    placesPannel: {},
    placesPannelTitle: {
        padding: '5px 10px',
        marginBottom: 10,
        backgroundColor: '#333',
        borderBottom: '1px solid #ccc'
    },
    placesPannelTitleText: {
        display: 'inline-block',
        color: '#fff',
        fontSize: 18,
        lineHeight: 2,
        margin: 0,
        verticalAlign: 'middle'
    },
    placesPannelContent: {
        padding: 10,
        height: MAP_EDITOR_HEIGHT - 50,
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
        width: 32,
        height: 16,
        float: 'right',
        borderRadius: 6,
        marginTop: 4
    },
}

const specialStyles = `
.placesElemHeaderLink:hover {
  background-color: #eee
}
`
