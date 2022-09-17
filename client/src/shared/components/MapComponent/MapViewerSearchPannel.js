import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputGroup, Form, Row, Col , FormGroup, Input,Label,InputGroupAddon} from 'reactstrap';
import { FormControl } from '@material-ui/core';
import {ROUTE_SEARCH_OPTIONS} from "./MapViewer";
import {DESTINATIONS_TYPES} from "./MapEditor";

export class MapViewerSearchPannel extends Component {
  static propTypes = {
    places: PropTypes.instanceOf(Array).isRequired
  };
  state = {
    activePlace: 0,
    filteredPlaces: [],
    showPlaces: false,
    fromInput: '',
    toInput: '',
    fromPlace: null,
    toPlace: null,
    focuseInput: '',
    searchOption:ROUTE_SEARCH_OPTIONS[0],

  };

  onChange = (e) => {
    const { places } = this.props;
    const id = e.currentTarget.id;
    const inputValue = e.currentTarget.value;
    const filteredPlaces = places.filter(
      (place) => {
        let placeName = place.name
        return placeName.toLowerCase().indexOf(inputValue.toLowerCase()) > -1  && DESTINATIONS_TYPES.includes(place.type) && place.status
      }
    );

    if( id == 'search_from' ){
      this.setState({
        activePlace: 0,
        filteredPlaces,
        showPlaces: true,
        fromInput: inputValue,
        focuseInput: id
      });
    } else if( id == 'search_to' ){
      this.setState({
        activePlace: 0,
        filteredPlaces,
        showPlaces: true,
        toInput: inputValue,
        focuseInput: id
      });
    }

  };

  onClick = (place, e) => {
    const { focuseInput } = this.state;

    if( focuseInput == 'search_from' ){
      this.setState({
        activePlace: 0,
        filteredPlaces: [],
        showPlaces: false,
        fromInput: place.name,
        fromPlace: place
      });
      this.props.onSearchPlaces( place, this.state.toPlace )
    } else if( focuseInput == 'search_to' ) {
      this.setState({
        activePlace: 0,
        filteredPlaces: [],
        showPlaces: false,
        toInput: place.name,
        toPlace: place
      });
      this.props.onSearchPlaces( this.state.fromPlace, place )
    }

  };
  onKeyDown = (e) => {
    const { activePlace, filteredPlaces } = this.state;
    const id = e.currentTarget.id;

    console.log("the on key down",activePlace);
    if(activePlace === undefined ){
      return;
    }
    if(filteredPlaces[activePlace] === undefined || filteredPlaces[activePlace] === null){
      return;
    }

    if (e.keyCode === 13) {
      if( id == 'search_from' ){
        this.setState({
          activePlace: 0,
          showPlaces: false,
          fromInput: filteredPlaces[activePlace].name,
          fromPlace: filteredPlaces[activePlace]
        });
        this.props.onSearchPlaces( filteredPlaces[activePlace], this.state.toPlace )
      } else if( id == 'search_to' ){
        this.setState({
          activePlace: 0,
          showPlaces: false,
          toInput: filteredPlaces[activePlace].name,
          toPlace: filteredPlaces[activePlace]
        });
        this.props.onSearchPlaces( this.state.fromPlace, filteredPlaces[activePlace] )
      }
    } else if (e.keyCode === 38) {
      if (activePlace === 0) {
        return;
      }
      this.setState({ activePlace: activePlace - 1 });
    } else if (e.keyCode === 40) {
      if (activePlace === filteredPlaces.length - 1) {
        console.log(activePlace);
        return;
      }
      this.setState({ activePlace: activePlace + 1 });
    }
  };


  updateSearchOption = (e) => {
    if(e.target.checked) {
      this.props.onRadioChange(e.target.value)
      this.setState({
        searchOption:e.target.value
      })
    }
    console.log(this.props.searchOption);


  }

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,

      state: { activePlace, filteredPlaces, showPlaces, fromInput, toInput }
    } = this;

    let checkList;
    if (fromInput || toInput) {
      checkList = (
          <div>
            {/*<Form.Check type="checkbox" controlId={'check_stair'} id={'check_stair'} value={this.props.check.stair} onChange={this.props.onCheckChange} label="Don't use the stair" />*/}
            {/*<Form.Check type="checkbox" controlId={'check_elevator'} id={'check_elevator'}  value={this.props.check.elevator} onChange={this.props.onCheckChange}  label="Don't use the elevator" />*/}
            {/*<Form.Check type="checkbox" controlId={'check_escalator'} id={'check_escalator'} value={this.props.check.escalator} onChange={this.props.onCheckChange} label="Don't use the escalator" />*/}
           <form>
             <div className="radio">
                 <input type="radio" name="bestRoute"  onChange={this.updateSearchOption} value={ROUTE_SEARCH_OPTIONS[0]} checked={this.state.searchOption ==ROUTE_SEARCH_OPTIONS[0]} />
                 <label style={styles.radioOptionLabel}>Best Route</label>
             </div>
             {/*<div className="radio">*/}
             {/*    <input type="radio" name="lessWalk" onChange={this.updateSearchOption} value={ROUTE_SEARCH_OPTIONS[1]} checked={this.state.searchOption ==ROUTE_SEARCH_OPTIONS[1]}  />*/}
             {/*    <label style={styles.radioOptionLabel} >Less Walking</label>*/}
             {/*</div>*/}
             <div className="radio">
                 <input type="radio" name="wheelchair" onChange={this.updateSearchOption}value={ROUTE_SEARCH_OPTIONS[2]} checked={this.state.searchOption==ROUTE_SEARCH_OPTIONS[2]}  />
                 <label style={styles.radioOptionLabel} >Wheelchair accessible</label>
             </div>
           </form>

          </div>
      );
    }

    let placeList;
    if (showPlaces && (fromInput || toInput)) {
      if (filteredPlaces.length) {
        placeList = (
          <ul style={styles.placesWrap}>
            {filteredPlaces.map((place, index) => {
              let className = 'placeElem';
              if (index === activePlace) {
                className = 'placeElem active';
              }
              return (
                <li style={styles.placeElem} className={className} key={place.id} onClick={onClick.bind(this, place)}>
                  <div style={styles.placeIconWrap}>

                  </div>
                  <div style={styles.placeInfoWrap}>
                    <p style={styles.placeName}>{place.name}</p>
                    <p style={styles.levelName}>{place.levelId}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        );
      } else {
        placeList = (
          <div style={styles.noPlaces}>
            <em>No Place!</em>
          </div>
        );
      }
    }
    return (
      <React.Fragment>
        <div style={styles.searchSec}>

          {
            this.props.currentPostion == null &&(
                <FormGroup as={Row} >
                  <Label column sm={3}>
                    Current
                  </Label>
                  <Col>
                    <InputGroup className="mb-3">
                      <Input
                          aria-label="Amount (to the nearest dollar)"
                          type="text"
                          onChange={onChange}
                          onKeyDown={onKeyDown}
                          value={fromInput}
                          id="search_from"
                      />
                      <InputGroupAddon>
                        <input type="submit" value="" style={styles.searchBtn} />
                      </InputGroupAddon>
                    </InputGroup>
                  </Col>
                </FormGroup>
            )
          }


          <FormGroup as={Row}>
            <Label column sm={3}>
              Target
            </Label>
            <Col>
              <InputGroup className="mb-3">
                <Input
                  aria-label="Amount (to the nearest dollar)"
                  type="text"
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  value={toInput}
                  id="search_to"
                />
                <InputGroupAddon>
                  <input type="submit" value="" style={styles.searchBtn} />
                </InputGroupAddon>
              </InputGroup>
              {/*{*/}
              {/*  checkList*/}
              {/*}*/}
            </Col>
          </FormGroup>
        </div>
        <div style={styles.listSec}>
          <style dangerouslySetInnerHTML={{__html: `
            .placeElem:hover {
              background-color: #eee !important
            }
            .placeElem.active {
              background-color: #eee !important
            }
          `}}/>
          {placeList}
        </div>

      </React.Fragment>
    );
  }
}

export default MapViewerSearchPannel;

const styles = {
  searchBtn: {
    height: '100%',
    width: 30,
    marginTop: 0,
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.2,
    backgroundColor: 'transparent',
    border: 0,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '70%',
    backgroundPosition: 'center center',
    backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAACnElEQVR4AcXZsUsbYRjH8e+dh2s1SyAGJwMJuDj1BIcEhJQIOnTq5F+QOf0jIq79A7oFh7aYyVBEkaZDC3awECc1AUXRIqUQotfFocnjJe/dk+b9PKP65Md7z13ee3Uwk2SNHKmngs5TnbDLJQqjA+RYZ4OXuDzvkSYf+cAJ44fPAYFhHeAzVhlqBBGrRoax8KjSJYhRXap4KCVoECiqQQKFLC0CZbXIElOBOwJ9cUchzm2Y5QsveN4tdfY4o00HSDHHPKuUmOV5v/D5SSSJ0MXfIY+HBB55dkIvRIIIvJDR28dnFJ/9kHH0MFaVDehRxlSZnuxAFUMZunKQKBJFUQ4wXTIYqcmPZ5GoFmUEahjw5eJTJI6ivBD4jCS/csrEVZZfU4yQk5OPhrwjcoRygQ0GVdCQf73OUEfisaMkHk1HDJHkYeDX82jlBzo+kCSEyxruwDP/EK1DbsWnhHDFgNTpodWjLgY9NECKfnvoyS4p8wBngN5Z/ABtQK8dP0AH0OuYB5iMqfAAMque7HJtHmAOPdnlxjzAPHqyy5V5gFX0ZJfj8AAn9CvhoeVRol8zPMAuj/xrlhW0Vpg1D3ApflhGR3b4wTlDvI24i4u+w9y0uyVrM213U1qxuy2/Z8bui8m23VezgGW7L6cBLdIWXs9FBAsHFCLCJI9opFMKXEzkkEp/IbK0bEdI0LARQRzVWoigPKy+Z5tlWooIiuP6NhVmAEiPNwLkqHDEw5CGx2wyDQDRI8T7l80U19xwxTFNmpwzKM1nFsyeCw7jFymCAxYjrHDp8r9cUOCUYRZ4Bw6AxVV47QJYXIVXLliNsOSC1Qh/XLAa4ZuDmmIcH1l2AaytwhZfmaAkn/qOb7eYBofJekOJJX7znfccAvwFyB3OeNys7d4AAAAASUVORK5CYII=")'
  },
  searchSec: {
    padding: '20px 20px 0',

  },
  listSec: {
    marginTop: 10,
    padding: 0,
    borderTopWidth: 3,
    borderTopColor: '#f00',
    borderTopStyle: 'solid',
    maxHeight: 400,
    overflow: 'auto'
  },
  placesWrap: {
    listStyle: 'none',
    padding: 0
  },
  placeElem: {
    border: '1px solid #ccc',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: '5px 10px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  placeIconWrap: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: 40,
    height: 40
  },
  placeInfoWrap: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  placeName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    margin: 0
  },
  levelName: {
    fontSize: 12,
    color: '#999',
    margin: 0
  },
  noPlaces: {
    padding: 20,
    textAlign: 'center'
  },
  radioOptionLabel:{
    marginLeft:5
  },

}
