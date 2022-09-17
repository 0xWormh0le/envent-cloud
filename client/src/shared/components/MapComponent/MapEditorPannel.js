import React, {PureComponent} from 'react';
import {ReactSVG} from 'react-svg'
import {
    Container,
    Row,
    Button,
    Form,
    Tooltip,
    UncontrolledTooltip,
    ButtonToolbar
} from 'reactstrap';

import {
    Card, CardBody, Col, Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';

import classnames from 'classnames';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';


import cloneDeep from 'lodash/cloneDeep'

import MapEditorAddPlacePannel from './MapEditorAddPlacePannel'
import MapEditorPlacesPannel from './MapEditorPlacesPannel'
import MapEditorPathNodesPannel from './MapEditorPathNodesPannel'
import MapEditorDirectionsPannel from './MapEditorDirectionsPannel'

import {ReactComponent as Add} from '../../img/icons/add.svg';
import {ReactComponent as Destination} from '../../img/icons/destination.svg';
import {ReactComponent as Link} from '../../img/icons/link.svg';
import {ReactComponent as Door} from '../../img/icons/door.svg';
import {ReactComponent as Escalator} from '../../img/icons/escalator.svg';
import {ReactComponent as Drawpath} from '../../img/icons/drawpath.svg';

import {PLACES_TYPES, DESTINATIONS_TYPES, CONNECTIONS_TYPES} from './MapEditor'
import MapEditorConnectionPannel from "./MapEditorConnectionPannel";

const MAP_EDITOR_WIDTH = '100%'
const MAP_EDITOR_HEIGHT = 675


export default class MapEditorPannel extends PureComponent {

    constructor(props) {
        super(props);

        let nodes = this._getPlacesFromMapData(this.props)
        console.log('-- MapEditorPannel nodes : ', nodes);
        this.state = {
            curLevel: nodes.curLevel,
            places: nodes.places,
            destinations: nodes.destinations,
            connections: nodes.connections,
            pathnodes: nodes.pathnodes,
            directions: nodes.directions,
            activePannel: this.props.activePannel,
            curLevelIdx: this.props.curLevelIdx,
            curPlaceId: this.props.curPlaceId,
            curDirectionId: this.props.curDirectionId,
            addPlaceX: this.props.addPlaceX,
            addPlaceY: this.props.addPlaceY,
            linkConnections: []
        };
    }


    componentWillReceiveProps(nextProps) {
        console.log('-- componentWillReceiveProps start : ', this.state.places);

        let nodes = this._getPlacesFromMapData(nextProps);
        if (this.state.curLevelIdx !== nextProps.curLevelIdx) {
            this.setState({
                curLevel: nodes.curLevel,
                places: nodes.places,
                destinations: nodes.destinations,
                connections: nodes.connections,
                pathnodes: nodes.pathnodes,
                directions: nodes.directions,
                linkConnections: nodes.linkConnections,
                activePannel: nextProps.activePannel,
                curLevelIdx: nextProps.curLevelIdx,
                curPlaceId: nextProps.curPlaceId,
            })
            return;
        }

        console.log('-- componentWillReceiveProps nodes : ', nodes);
        let placesJSON = JSON.stringify(this.state.places);
        let newPlacesJSON = JSON.stringify(nodes.places);
        let destinationsJSON = JSON.stringify(this.state.destinations);
        let newDestinationsJSON = JSON.stringify(nodes.destinations);
        let connectionsJSON = JSON.stringify(this.state.connections);
        let newConnectionsJSON = JSON.stringify(nodes.connections);
        let pathnodesJSON = JSON.stringify(this.state.pathnodes);
        let newPathnodesJSON = JSON.stringify(nodes.pathnodes);
        let directionsJSON = JSON.stringify(this.state.directions);
        let newDirectionsJSON = JSON.stringify(nodes.directions);

        console.log('-- componentWillReceiveProps places : ', this.state.places, nodes.places);
        console.log('-- componentWillReceiveProps level : ', this.state.curLevelIdx, nextProps.curLevelIdx);
        console.log('-- componentWillReceiveProps place : ', this.state.curPlaceId, nextProps.curPlaceId);
        console.log('-- componentWillReceiveProps panel : ', this.state.activePannel, nextProps.activePannel);

        if (placesJSON != newPlacesJSON || destinationsJSON != newDestinationsJSON || connectionsJSON != newConnectionsJSON ||
            pathnodesJSON != newPathnodesJSON || directionsJSON != newDirectionsJSON) {
            console.log('-- 4');
            this.setState({
                places: nodes.places,
                destinations: nodes.destinations,
                connections: nodes.connections,
                pathnodes: nodes.pathnodes,
                directions: nodes.directions,
                linkConnections: nodes.linkConnections,
            })
            return;
        } else if (this.state.curLevelIdx == nextProps.curLevelIdx && this.state.curDirectionId != nextProps.curDirectionId) {
            this.setState({activePannel: 'directions', curDirectionId: nextProps.curDirectionId});
            this.props.onSelectPannel('directions')
            return;
        } else if (this.state.curLevelIdx == nextProps.curLevelIdx && this.state.curPlaceId != nextProps.curPlaceId) {
            let idx = -1;
            idx = this.state.places.findIndex(place => place.id == nextProps.curPlaceId);
            console.log('---- 1 : ', idx);
            if (idx > -1) {
                this.setState({activePannel: 'places', curPlaceId: nextProps.curPlaceId});
                this.props.onSelectPannel('places')
                return;
            }

            idx = this.state.destinations.findIndex(place => place.id == nextProps.curPlaceId);
            console.log('---- 2 : ', idx);
            if (idx > -1) {
                this.setState({activePannel: 'destinations', curPlaceId: nextProps.curPlaceId});
                this.props.onSelectPannel('destinations')
                return;
            }

            idx = this.state.connections.findIndex(place => place.id == nextProps.curPlaceId);
            console.log('---- 3 : ', idx);
            if (idx > -1) {
                this.setState({activePannel: 'connections', curPlaceId: nextProps.curPlaceId});
                this.props.onSelectPannel('connections')
                return;
            }

            idx = this.state.pathnodes.findIndex(place => place.id == nextProps.curPlaceId);
            console.log('---- 4 : ', idx);
            if (idx > -1) {
                this.setState({activePannel: 'pathnodes', curPlaceId: nextProps.curPlaceId});
                this.props.onSelectPannel('pathnodes')
                return;
            }
        } else if (this.state.curLevelIdx == nextProps.curLevelIdx && this.state.activePannel != nextProps.activePannel) {
            console.log('---- 4 : ');
            this.setState({activePannel: nextProps.activePannel})
            this.props.onSelectPannel(nextProps.activePannel)
            return;

        } else if (this.state.curLevelIdx == nextProps.curLevelIdx && this.state.curPlaceId == nextProps.curPlaceId && this.state.curDirectionId == nextProps.curDirectionId && this.state.activePannel == nextProps.activePannel && this.state.places.length > 0) {
            console.log('-- 5', nextProps.addPlaceX, nextProps.addPlaceY)
            if (nextProps.activePannel == 'directions') {
                console.log('-- 7 : ', nextProps.activePannel, nextProps.curDirectionId)
                this.setState({
                    activePannel: 'directions',
                    curDirectionId: nextProps.curDirectionId
                });
                this.props.onSelectPannel('directions')
                return;
            }

            if (nextProps.addPlaceX != 0 && nextProps.addPlaceY != 0) {
                console.log('-- 6 : ', this.setState.activePannel, nextProps.activePannel)
                this.setState({
                    addPlaceX: nextProps.addPlaceX,
                    addPlaceY: nextProps.addPlaceY
                })
                return;
            }

            let idx = -1;
            console.log('-- 0 : ', this.state.places, this.state.destinations, this.state.connections, this.state.pathnodes, nextProps.curPlaceId, this.state)
            idx = nodes.places.findIndex(place => place.id == nextProps.curPlaceId);
            if (idx > -1 && nextProps.activePannel != 'places') {
                console.log('-- 1');
                this.setState({
                    activePannel: 'places',
                    places: nodes.places,
                    destinations: nodes.destinations,
                    connections: nodes.connections,
                    pathnodes: nodes.pathnodes,
                    linkConnections: nodes.linkConnections,
                });
                this.props.onSelectPannel('places')
                return;
            }

            idx = nodes.destinations.findIndex(place => place.id == nextProps.curPlaceId);
            if (idx > -1 && nextProps.activePannel != 'destinations') {
                console.log('-- 2');
                this.setState({
                    activePannel: 'destinations',
                    places: nodes.places,
                    destinations: nodes.destinations,
                    connections: nodes.connections,
                    pathnodes: nodes.pathnodes,
                    linkConnections: nodes.linkConnections,
                });
                this.props.onSelectPannel('destinations')
                return;
            }

            idx = nodes.connections.findIndex(place => place.id == nextProps.curPlaceId);
            if (idx > -1 && nextProps.activePannel != 'connections') {
                console.log('-- 3');
                this.setState({
                    activePannel: 'connections',
                    places: nodes.places,
                    destinations: nodes.destinations,
                    connections: nodes.connections,
                    pathnodes: nodes.pathnodes,
                    linkConnections: nodes.linkConnections,
                });
                this.props.onSelectPannel('connections')
                return;
            }

            idx = nodes.pathnodes.findIndex(place => place.id == nextProps.curPlaceId);
            if (idx > -1 && nextProps.activePannel != 'pathnodes') {
                console.log('-- 4');
                this.setState({
                    activePannel: 'pathnodes',
                    places: nodes.places,
                    destinations: nodes.destinations,
                    connections: nodes.connections,
                    pathnodes: nodes.pathnodes,
                    linkConnections: nodes.linkConnections,
                });
                this.props.onSelectPannel('pathnodes')
                return;
            }
        }
    }


    _getPlacesFromMapData(props) {
        let {map, curLevelIdx} = props;
        let places = [];
        let destinations = [];
        let connections = [];
        let pathnodes = [];
        let directions = [];
        let curLevel = null;
        let linkConnections = [];

        if (map && map.mapData && map.mapData.levels && map.mapData.levels[curLevelIdx] && map.mapData.levels[curLevelIdx].places) {
            curLevel = map.mapData.levels[curLevelIdx]
            let nodes = cloneDeep(map.mapData.levels[curLevelIdx].places);
            console.log('--------------- 1', curLevelIdx, map.mapData);
            if (curLevelIdx < map.mapData.levels.length - 1) {
                console.log('--------------- 2');
                let nextLevelPlaces = cloneDeep(map.mapData.levels[curLevelIdx + 1].places);
                linkConnections = nextLevelPlaces.filter(place => {
                    return CONNECTIONS_TYPES.includes(place.type)
                })
                console.log('-- linkConnections : ', linkConnections);
            }
            console.log('--------------- 3', linkConnections);

            directions = cloneDeep(map.mapData.levels[curLevelIdx].directions);

            for (var i = 0; i < nodes.length; i++) {
                if (DESTINATIONS_TYPES.includes(nodes[i].type)) {
                    destinations.push(nodes[i])
                } else if (CONNECTIONS_TYPES.includes(nodes[i].type)) {
                    connections.push(nodes[i])

                    console.log(' -- connections in the editor pannel')

                } else if (nodes[i].type == 'place') {
                    places.push(nodes[i])
                } else if (nodes[i].type == 'pathnode') {
                    pathnodes.push(nodes[i])
                }
            }
        }

        return {places, destinations, connections, pathnodes, directions, curLevel, linkConnections}
    }


    onSelectPannel = (activePannel) => {
        this.setState({
            activePannel: activePannel
        })
        this.props.onSelectPannel(activePannel)
    }

    render() {
        let {places, destinations, connections, pathnodes, directions, activePannel, curLevel, curLevelIdx, curPlaceId, curDirectionId, addPlaceX, addPlaceY, linkConnections} = this.state

        return (
            <Col style={styles.pannelWrap}>
                <Row style={styles.pannelPan}>
                    <Col style={{padding:0}}>
                        <div className="tabs tabs--vertical tabs--vertical-colored">
                            <div className="tabs__wrap">
                                <Nav tabs>
                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="addplaceNavItem">
                                            Add Place
                                        </UncontrolledTooltip>
                                        <NavLink
                                            style={styles.toolBtn}
                                            id="addplaceNavItem"
                                            className={classnames({active: activePannel === 'addplace'})}
                                            onClick={() => {
                                                this.onSelectPannel('addplace');
                                            }}
                                        >
                                            <Add style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="placeNavItem">
                                            Places
                                        </UncontrolledTooltip>
                                        <NavLink
                                            className={classnames({active: activePannel === 'places'})}
                                            style={styles.toolBtn}
                                            id="placeNavItem"
                                            onClick={() => {
                                                this.onSelectPannel('places');
                                            }}
                                        >
                                            <Door style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="destinationsNavItem">
                                            Destinations
                                        </UncontrolledTooltip>
                                        <NavLink
                                            className={classnames({active: activePannel === 'destinations'})}
                                            id="destinationsNavItem"
                                            style={styles.toolBtn}
                                            onClick={() => {
                                                this.onSelectPannel('destinations');
                                            }}
                                        >
                                            <Destination style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="connectionsNavItem">
                                            Connections
                                        </UncontrolledTooltip>
                                        <NavLink
                                            className={classnames({active: activePannel === 'connections'})}
                                            style={styles.toolBtn}
                                            id="connectionsNavItem"
                                            onClick={() => {
                                                this.onSelectPannel('connections');
                                            }}
                                        >
                                            <Escalator style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="pathnodesNavItem">
                                            Make Path
                                        </UncontrolledTooltip>
                                        <NavLink
                                            className={classnames({active: activePannel === 'pathnodes'})}
                                            style={styles.toolBtn}
                                            id="pathnodesNavItem"
                                            onClick={() => {
                                                this.onSelectPannel('pathnodes');
                                            }}
                                        >
                                            <Drawpath style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <UncontrolledTooltip dir={'left'} placement="left" target="directionsNavItem">
                                            Directions
                                        </UncontrolledTooltip>
                                        <NavLink
                                            className={classnames({active: activePannel === 'directions'})}
                                            style={styles.toolBtn}
                                            id="directionsNavItem"
                                            onClick={() => {
                                                this.onSelectPannel('directions');
                                            }}
                                        >
                                            <Link  style={styles.toolBtnImg}/>
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={activePannel}  style={{width:'100%',backgroundColor:'white',paddingLeft: 0}}>
                                    <TabPane tabId="addplace"  style={styles.tapPane}>
                                        <MapEditorAddPlacePannel
                                            curLevel={curLevel}
                                            curLevelIdx={curLevelIdx}
                                            onPickLocation={this.props.onPickLocation}
                                            onPlaceName={this.props.onPlaceName}
                                            onPlaceType={this.props.onPlaceType}
                                            onAddPlace={this.props.onAddPlace}
                                            addPlaceX={addPlaceX}
                                            addPlaceY={addPlaceY}
                                        />
                                    </TabPane>
                                    <TabPane tabId="places" style={styles.tapPane}>
                                        <MapEditorPlacesPannel
                                            title="Places List"
                                            places={places}
                                            curLevelIdx={curLevelIdx}
                                            curPlaceId={curPlaceId}
                                            onPlaceClick={this.props.onPlaceClick}
                                            onPickLocation={this.props.onPickLocation}
                                            onPlaceName={this.props.onPlaceName}
                                            onPlaceType={this.props.onPlaceType}
                                            onPlaceStatus={this.props.onPlaceStatus}
                                            onDeletePlace={this.props.onDeletePlace}
                                            onPickDirection={this.props.onPickDirection}
                                            onAmenityGroupByCheckChange={this.props.onAmenityGroupByCheckChange}
                                            addPlaceX={addPlaceX}
                                            addPlaceY={addPlaceY}
                                        />
                                    </TabPane>
                                    <TabPane tabId="destinations" style={styles.tapPane}>
                                        <MapEditorPlacesPannel
                                            title="Destinations List"
                                            places={destinations}
                                            curLevelIdx={curLevelIdx}
                                            curPlaceId={curPlaceId}
                                            onPlaceClick={this.props.onPlaceClick}
                                            onPickLocation={this.props.onPickLocation}
                                            onPlaceName={this.props.onPlaceName}
                                            onPlaceType={this.props.onPlaceType}
                                            onPlaceSubType={this.props.onPlaceSubType}
                                            onPlaceStatus={this.props.onPlaceStatus}
                                            onDeletePlace={this.props.onDeletePlace}
                                            onPickDirection={this.props.onPickDirection}
                                            onAmenityGroupByCheckChange={this.props.onAmenityGroupByCheckChange}
                                            addPlaceX={addPlaceX}
                                            addPlaceY={addPlaceY}
                                        />
                                    </TabPane>
                                    <TabPane tabId="connections" style={styles.tapPane} >
                                        <MapEditorConnectionPannel
                                            title="Connections List"
                                            places={connections}
                                            curLevelIdx={curLevelIdx}
                                            curPlaceId={curPlaceId}
                                            onPlaceClick={this.props.onPlaceClick}
                                            onPickLocation={this.props.onPickLocation}
                                            onPlaceName={this.props.onPlaceName}
                                            onPlaceType={this.props.onPlaceType}
                                            onPlaceConnection={this.props.onPlaceConnection}
                                            onConnectionTime={this.props.onConnectionTime}
                                            onWheelchairCheckChange={this.props.onWheelchairCheckChange}
                                            onStairDistChange={this.props.onStairDistChange}
                                            onPlaceStatus={this.props.onPlaceStatus}
                                            onDeletePlace={this.props.onDeletePlace}
                                            onPickDirection={this.props.onPickDirection}
                                            addPlaceX={addPlaceX}
                                            addPlaceY={addPlaceY}
                                            linkConnections={linkConnections}
                                        />
                                    </TabPane>
                                    <TabPane tabId="pathnodes" style={styles.tapPane}>
                                        <MapEditorPathNodesPannel
                                            title="Path Nodes List"
                                            places={pathnodes}
                                            curLevelIdx={curLevelIdx}
                                            curPlaceId={curPlaceId}
                                            onPlaceClick={this.props.onPlaceClick}
                                            onDeletePlace={this.props.onDeletePlace}
                                            onDrawingPath={this.props.onDrawingPath}
                                        />
                                    </TabPane>
                                    <TabPane tabId="directions" style={styles.tapPane}>
                                        <MapEditorDirectionsPannel
                                            title="Directions List"
                                            directions={directions}
                                            curLevelIdx={curLevelIdx}
                                            curDirectionId={curDirectionId}
                                            onDirectionClick={this.props.onDirectionClick}
                                            onDirectionStatus={this.props.onDirectionStatus}
                                            onDeleteDirection={this.props.onDeleteDirection}
                                        />
                                    </TabPane>
                                </TabContent>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
        )
    }
}

const styles = {
    tapPane:{
        paddingLeft: 5,
    },
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
        height: '100%',
        padding:0,
    },
    pannelPan: {
        height: '100%',
        margin: 0
    },
    toolBtn: {
        width: '100%',
        paddingTop: 'calc( 100% + 1px )',
        position: 'relative',
        borderRightWidth: 0,
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
    toolBtnText: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        color: '#000',
        fontSize: 12
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
        width: 12,
        height: 12,
        backgroundColor: '#dc3545',
        float: 'right',
        borderRadius: 6,
        marginTop: 5
    },

}

const specialStyles = `
.placesElemHeaderLink:hover {
  background-color: #eee
}
`
