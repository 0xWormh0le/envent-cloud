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
import {AMENITIES_TYPES, PLACES_TYPES} from './MapEditor'
import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import Switch from "react-switch";

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


export default class MapEditorAddPlacePannel extends React.Component {

    elemRefArr = [];

    constructor(props) {
        super(props);

        this.state = {
            curLevel: this.props.curLevel,
            isVisibleAddModal: false,
            addPlaceId: '',
            addPlaceName: '',
            addPlaceX: '',
            addPlaceY: '',
            addPlaceType: 'place',
            addPlaceSubType: 'toilet',
            isPickLocation: false,
            groupBy: false,
        };

        this.openAddModal = this.openAddModal.bind(this)
        this.onAddPlace = this.onAddPlace.bind(this)
    }


    componentWillReceiveProps(nextProps) {
        console.log('-- MapEdiitorAddPlacePannel ', this.state.isPickLocation, nextProps.addPlaceX, nextProps.addPlaceY)
        if (this.state.isPickLocation && nextProps.addPlaceX != 0 && nextProps.addPlaceY != 0) {
            console.log('-- MapEdiitorAddPlacePannel 1')
            this.setState({
                curLevel: nextProps.curLevel,
                addPlaceX: nextProps.addPlaceX,
                addPlaceY: nextProps.addPlaceY,
                isPickLocation: false
            })
        }
    }


    onPlaceName = (event) => {
        this.setState({
            addPlaceName: event.currentTarget.value
        })
    }


    onTypeSelect = (event) => {
        console.log('the onType Select')
        this.setState({
            addPlaceType: event.target.value
        })
    }

    onAmenitySubTypeSelect = (event) => {
        console.log('the onType Select')
        this.setState({
            addPlaceSubType: event.target.value,
            addPlaceName: event.target.value,
        })
    }

    onAmenityGroupByCheck = (status) => {
        console.log('-- status : ', status)
        this.setState({
            groupBy: status
        })
    }


    renderTypeDropdown(place) {
        let dropdownItemsArr = [];

        for (var i = 0; i < PLACES_TYPES.length; i++) {
            let typeName = PLACES_TYPES[i].charAt(0).toUpperCase() + PLACES_TYPES[i].slice(1);
            dropdownItemsArr.push(
                <DropdownItem as="button" value={PLACES_TYPES[i]} onClick={this.onTypeSelect}
                              key={'typedropitem_' + i}>{typeName}</DropdownItem>
            )
        }

        let placeTypeName = this.state.addPlaceType.charAt(0).toUpperCase() + this.state.addPlaceType.slice(1)

        return (
            <UncontrolledDropdown className="d-block">
                <ButtonGroup dir="ltr">
                    <DropdownToggle color="primary" className="icon icon--right">
                        <p>{placeTypeName} <ChevronDownIcon/></p>
                    </DropdownToggle>
                </ButtonGroup>
                <DropdownMenu as={CustomMenu}>
                    {dropdownItemsArr}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }


    renderAmenitiesTypeDropdown() {
        let dropdownItemsArr = [];
        for (var i = 0; i < AMENITIES_TYPES.length; i++) {
            let typeName = AMENITIES_TYPES[i].charAt(0).toUpperCase() + AMENITIES_TYPES[i].slice(1);
            dropdownItemsArr.push(
                <DropdownItem as="button" value={AMENITIES_TYPES[i]} onClick={this.onAmenitySubTypeSelect}
                              key={'typedropitem_' + i}>{typeName}</DropdownItem>
            )
        }

        let placeTypeName = AMENITIES_TYPES[0].charAt(0).toUpperCase() + AMENITIES_TYPES[0].slice(1)
        return (
            <UncontrolledDropdown className="d-block">

                <ButtonGroup dir="ltr">
                    <DropdownToggle color="primary" className="icon icon--right">
                        <p>{placeTypeName} <ChevronDownIcon/></p>
                    </DropdownToggle>
                </ButtonGroup>

                <DropdownMenu as={CustomMenu}>
                    {dropdownItemsArr}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }


    openAddModal = () => {
        let curTime = new Date();

        this.setState({
            isVisibleAddModal: !this.state.isVisibleAddModal,
            addPlaceId: 'd_' + curTime.getTime()
        })
    }


    onPickLocation = () => {
        this.setState({
            isPickLocation: !this.state.isPickLocation
        })
        this.props.onPickLocation(!this.state.isPickLocation)
    }


    onAddPlace = () => {

        console.log('onAddPlace in the mapEditor Add Place panel  cur level', this.state.curLevel, this.state.addPlaceName)
        if (this.state.addPlaceName === '') {
            return;
        }
        if (this.state.curLevel === null) {
            console.log(this.props.curLevel);
            return;
        }


        let isWheelchair = false;
        let time = 1;
        let stairDist = 0;
        if (this.state.addPlaceType === 'elevator') {
            time = 3;
            isWheelchair = true;
        } else if (this.state.addPlaceType === 'stair') {
            time = 4;
            stairDist = 40;
        } else if (this.state.addPlaceType === 'escalator') {
            time = 2;
        }

        this.props.onAddPlace({
            id: this.state.addPlaceId,
            levelId: this.state.curLevel.id,
            fillId: '',
            name: this.state.addPlaceName,
            x: 0,
            y: 0,
            absX: this.state.addPlaceX,
            absY: this.state.addPlaceY,
            type: this.state.addPlaceType,
            status: false,
            direction: '',
            time: time,
            stairDist: stairDist,
            isWheelchair: isWheelchair,
            groupBy: false,
            subType: this.state.addPlaceSubType
        })

        this.setState({
            addPlaceX: 0,
            addPlaceY: 0,
            addPlaceType: 'place',
            addPlaceName: '',
            addPlaceId: '',
            isPickLocation: false,
            isVisibleAddModal: false,
        })
    }

    render() {
        let {isVisibleAddModal, addPlaceId, addPlaceName, addPlaceX, addPlaceY, isPickLocation, groupBy} = this.state;

        return (
            <div style={styles.placesPannel}>
                <div style={styles.placesPannelTitle}>
                    <h3 style={styles.placesPannelTitleText}>Places List</h3>
                    <Button color="success" size={"sm"} style={styles.placesPannelAddBtn} onClick={this.openAddModal}>Add
                        Place</Button>
                </div>
                <div className="clearfix"></div>
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

                    {isVisibleAddModal && <div style={styles.addModal}>
                        <form className="form">

                            <div className="form__form-group">
                                <span className="form__form-group-label">ID</span>
                                <div className="form__form-group-field">
                                    <Input
                                        name="defaultInput"
                                        component="input"
                                        type="text"
                                        value={addPlaceId}
                                        placeholder=""
                                        readonly
                                    />
                                </div>
                            </div>

                            <div className="form__form-group d-block">
                                <span className="form__form-group-label">Name</span>
                                <div className="form__form-group-field">
                                    <Input
                                        name="defaultInput"
                                        component="input"
                                        type="text"
                                        value={addPlaceName}
                                        placeholder="Place Name"
                                        onChange={this.onPlaceName}
                                    />
                                </div>
                            </div>


                            <div className="form__form-group d-block">
                                <span className="form__form-group-label d-block">Location</span>
                                <Button
                                    color={isPickLocation ? "success" : "primary"}
                                    size="sm"
                                    onClick={this.onPickLocation}
                                >
                                    {isPickLocation ? 'Picking Now...' : 'Pick Location'}
                                </Button>
                                <div className="clearfix"></div>
                                <Row style={{margin: '10px 0 0 0'}}>
                                    <Col sm="2" style={{padding: '0 10px 0 0', textAlign: 'right'}}>x: </Col>
                                    <Col sm="4" style={{padding: 0}}>
                                        <div className="form__form-group-field">
                                            <Input
                                                name="defaultInput"
                                                component="input"
                                                value={addPlaceX}
                                                placeholder="0.000"
                                                disabled
                                            />
                                        </div>
                                    </Col>
                                    <Col sm="2" style={{padding: '0 10px 0 0', textAlign: 'right'}}>y: </Col>
                                    <Col sm="4" style={{padding: 0}}>
                                        <div className="form__form-group-field">
                                            <Input
                                                name="defaultInput"
                                                component="input"
                                                value={addPlaceY}
                                                placeholder="0.000"
                                                disabled
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="form__form-group d-block">
                                <span className="form__form-group-label d-block">Type</span>
                                {this.renderTypeDropdown()}
                            </div>

                            <div className="d-block">
                                <span className="form__form-group-label d-block">Group by tenant name</span>

                                <span style={styles.placesElemHeaderLinkStatus}>
                                  <Switch onChange={this.onAmenityGroupByCheck}
                                          checked={groupBy}
                                          height={16} width={32} checkedIcon={false}
                                          uncheckedIcon={false}/>
                                </span>
                            </div>

                            <div className="clearfix"></div>

                        </form>
                        <div className="form__form-group mt-3">
                            <Button size={'sm'} color="success"
                                    onClick={this.onAddPlace} block>Add</Button>
                        </div>
                    </div>}
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
        padding: '8px 10px',
        marginBottom: 10,
        backgroundColor: '#ddd',
        borderBottom: '1px solid #ccc'
    },
    placesPannelTitleText: {
        display: 'inline-block',
        color: '#333',
        fontSize: 18,
        lineHeight: 2,
        margin: 0,
        verticalAlign: 'middle'
    },
    placesPannelAddBtn: {
        float: 'right',
        display: 'inline-block',
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
        width: 12,
        height: 12,
        backgroundColor: '#dc3545',
        float: 'right',
        borderRadius: 6,
        marginTop: 5
    },
    addModal: {
        // backgroundColor: '#fff',
        border: '1px solid #ddd',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5
    },
    pickLocationBtn: {
        float: 'right'
    }
}

const specialStyles = `
.placesElemHeaderLink:hover {
  background-color: #eee
}
`
