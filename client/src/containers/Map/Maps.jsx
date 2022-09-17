import React, { PureComponent } from 'react';

import {
  Button,
  Row,
  Container,
  Modal,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  FormGroup,
  Label,
  Input,
  InputGroup
} from 'reactstrap';

import classNames from 'classnames';
import { ReactSVG } from 'react-svg';

import { withRouter } from 'react-router-dom';

// redux
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { compose } from 'redux';
import requireRole from '../../hoc/requireRole';
import {
  getMapProcessing,
  getMapError,
  getMaps,
  getMap,
  getUploadProcessing,
  getUploadError,
  getUpload
} from '../../redux/selectors';
import { loadMaps, loadMap, addMap } from '../../redux/actions/map.actions';
import { uploadFile } from '../../redux/actions/upload.actions';
import { withTranslation } from 'react-i18next';

class WayMaps extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maps: this.props.maps,
      isVisibleAddMapModal: false,
      addMapValidated: false,
      mapName: '',
      mapSVGFile: null,
      addedMap: null
    };

    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.loadMaps();
  }

  loadMaps = () => {
    this.props.loadMaps().then(() => {
      if (this.props.errorMessage) {
        // throw new SubmissionError({ _error: this.props.errorMessage });
      }

      this.setState({
        maps: this.props.maps
      });
    });
  };

  loadSVG = svg => {
    const firstGElements = [...svg.querySelectorAll('g[filter]')];
    console.log('-- firstGElements : ', firstGElements);

    for (let i = 0; i < firstGElements.length; i++) {
      // console.log('-- firstGElements[i] : ', firstGElements[i]);
      const levelElem = firstGElements[i].children[0];
      // console.log('-- levelElem : ', levelElem);

      // Move to valid area. This is because map is in left-top corner when loading time.
      // So, we need to move it to center position of screen. [540, 200]
      let { matrix } = levelElem.parentNode.transform.baseVal[0];
      matrix = matrix.translate(130, 70);
      matrix = matrix.scale(0.25);
      levelElem.parentNode.transform.baseVal[0].setMatrix(matrix);

      // if level is not first level, hide level elem.
      if (i !== 0) levelElem.parentNode.setAttribute('visibility', 'hidden');
    }
  };

  openAddMapModal = () => {
    this.setState({
      isVisibleAddMapModal: true
    });
  };

  closeAddMapModal = () => {
    console.log('-- closeAddMapModal start');
    this.setState({
      isVisibleAddMapModal: false
    });
  };

  toggle() {
    this.setState(prevState => ({
      isVisibleAddMapModal: !prevState.isVisibleAddMapModal
    }));
  }

  onAddMapSave = event => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      this.setAddMapValidated(true);
    } else {
      const mapData = {};
      const data = {
        mapName: this.state.mapName,
        mapSVG: this.state.mapSVGFile,
        mapData: JSON.stringify(mapData)
      };
      this.props.addMap(data).then(() => {
        if (this.props.errorMMessage) {
          throw new SubmissionError({ _error: this.props.errorMessage });
        }

        this.setState({
          addedMap: this.props.addedMap,
          isVisibleAddMapModal: false
        });

        this.loadMaps();
      });
    }

    event.preventDefault();
    event.stopPropagation();
  };

  setAddMapValidated = validate => {
    this.setState({
      addMapValidated: validate
    });
  };

  onChangeManNameText = event => {
    console.log('-- event : ', event);
    this.setState({
      mapName: event.currentTarget.value
    });
  };

  onChangeSVGFile = e => {
    const file = e.currentTarget.files[0];
    console.log('-- e1 : ', file);

    this.props.uploadFile(file);
    this.props.uploadFile(file).then(() => {
      if (this.props.errorUploadMessage) {
        throw new SubmissionError({ _error: this.props.errorUploadMessage });
      }

      this.setState({
        mapSVGFile: this.props.upload
      });

      console.log('-- mapSVGFile : ', this.props.upload);
    });
  };

  onClickEditBtn = (map, e) => {
    console.log('-- e', e);
    e.stopPropagation();
    e.preventDefault();
    console.log(
      '-- onClickEditBtn : ',
      this.props.history,
      `/wayfinder/editor/${map._id}`
    );
    this.props.history.push(`/wayfinder/editor/${map._id}`);
  };

  onClickViewBtn = map => {
    console.log(
      '-- onClickViewBtn : ',
      this.props.history,
      `/wayfinder/viewer/${map._id}`
    );
    this.props.history.replace(`/wayfinder/viewer/${map._id}`);
  };

  render() {
    const { maps, isVisibleAddMapModal, addMapValidated, mapName } = this.state;

    const { rtl } = this.props;

    const color = 'primary';

    let Icon;
    switch (color) {
      case 'primary':
        Icon = <span className="lnr lnr-pushpin modal__title-icon" />;
        break;
      case 'success':
        Icon = <span className="lnr lnr-thumbs-up modal__title-icon" />;
        break;
      case 'warning':
        Icon = <span className="lnr lnr-flag modal__title-icon" />;
        break;
      case 'danger':
        Icon = <span className="lnr lnr-cross-circle modal__title-icon" />;
        break;
      default:
        break;
    }
    const modalClass = classNames({
      'modal-dialog--colored': false,
      'modal-dialog--header': true
    });

    const mapsArr = [];
    if (maps && maps.length > 0) {
      for (let i = 0; i < maps.length; i++) {
        const map = maps[i];

        mapsArr.push(
          <Col key={map._id} style={styles.mapElem} xs={3}>
            <a
              style={styles.mapElemInnerWrap}
              onClick={this.onClickViewBtn.bind(this, map)}
            >
              <div style={styles.mapElemImgWrap}>
                <div style={styles.mapElemImg}>
                  <ReactSVG src={map.mapSVG} beforeInjection={this.loadSVG} />
                </div>
              </div>
              <div style={styles.mapElemName}>
                <span>{map.mapName}</span>
                <Button
                  color="light"
                  size="sm"
                  style={styles.mapElemActionBtn}
                  onClick={this.onClickEditBtn.bind(this, map)}
                >
                  Edit
                </Button>
              </div>
            </a>
          </Col>
        );
      }
    }

    return (
      <Container className="dashboard">
        <Container style={styles.section}>
          <Button
            color="primary"
            size={'sm'}
            onClick={this.openAddMapModal.bind(this)}
          >
            Add Map
          </Button>{' '}
        </Container>
        <Container style={styles.section}>
          <Row>{mapsArr}</Row>
        </Container>

        <Modal
          isOpen={isVisibleAddMapModal}
          toggle={this.toggle}
          modalClassName={`${rtl.direction}-support`}
          className={`modal-dialog--${color} ${modalClass}`}
        >
          <div className="modal__header">
            <button
              className="lnr lnr-cross modal__close-btn"
              type="button"
              onClick={this.toggle}
            />
            {Icon}
            <h4 className="text-modal  modal__title">Add Map</h4>
          </div>

          <form
            className="form"
            noValidate
            validated={addMapValidated}
            onSubmit={this.onAddMapSave.bind(this)}
          >
            <div className="modal__body">
              <FormGroup controlId="formBasicPassword">
                <Label>Map Name</Label>
                <Input
                  type="text"
                  required
                  onChange={this.onChangeManNameText.bind(this)}
                  value={mapName}
                />
                {/*<Form.Control.Feedback type="invalid">*/}
                {/*  Please input map name*/}
                {/*</Form.Control.Feedback>*/}
              </FormGroup>

              <FormGroup controlId="formBasicPassword">
                <Label>SVG file</Label>
                <Input
                  type="file"
                  required
                  onChange={this.onChangeSVGFile.bind(this)}
                />
                {/*<Form.Control.Feedback type="invalid">*/}
                {/*  Please select map svg file*/}
                {/*</Form.Control.Feedback>*/}
              </FormGroup>
            </div>
            <ButtonToolbar className="modal__body">
              <Button color="secondary" size={'sm'} onClick={this.toggle}>
                Cancel
              </Button>{' '}
              <Button color="primary" size={'sm'} type="submit">
                Add Map
              </Button>
            </ButtonToolbar>
          </form>
        </Modal>
      </Container>

      // <MapEditor
      //   src="http://exidea.tech/wp-content/uploads/2020/03/maps2.svg"
      //   offset={{x: 540, y:200}}
      // />
    );
  }
}

const mapStateToProps = state => ({
  maps: getMaps(state),
  addedMap: getMap(state),
  isProcessing: getMapProcessing(state),
  errorMessage: getMapError(state),
  upload: getUpload(state),
  isUploadProcessing: getUploadProcessing(state),
  errorUploadMessage: getUploadError(state),
  themeName: state.theme.className,
  rtl: state.rtl
});

export default connect(mapStateToProps, {
  loadMaps,
  loadMap,
  uploadFile,
  addMap
})(withTranslation('common')(withRouter(WayMaps)));

// export default compose(
//   requireRole('user'),
//   connect(mapStateToProps, {
//     loadMaps,
//     loadMap,
//     uploadFile,
//     addMap,
//   }),
// )(withTranslation('common')(WayMaps));

const styles = {
  section: {
    marginTop: 30
  },
  mapElem: {},
  mapElemInnerWrap: {
    borderRadius: 10,
    cursor: 'pointer',
    textDecoration: 'none'
  },
  mapElemImgWrap: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    border: '1px solid #f0f0f0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  mapElemImg: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  mapElemName: {
    padding: '15px',
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    fontSize: 16,
    color: '#fff'
  },
  mapElemActionBtn: {
    float: 'right',
    marginLeft: 10
  }
};
