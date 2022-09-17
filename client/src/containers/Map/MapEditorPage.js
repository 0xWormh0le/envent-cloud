import React, {PureComponent} from 'react';

// custom component

// redux
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { compose } from 'redux';
import MapEditor from '../../shared/components/MapComponent/MapEditor';
import requireRole from '../../hoc/requireRole';
import {
  getMapProcessing, getMapError, getMap,
} from '../../redux/selectors';
import {
  loadMap,
  updateMap,
} from '../../redux/actions/map.actions';
import {withTranslation} from "react-i18next";


class MapEditorPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      map: this.props.map,
    };
  }


  componentDidMount() {
    this.loadMap();
  }


  loadMap = () => {
    const { id } = this.props.match.params;
    console.log('-- id : ', id);

    // let mm = '5e70d70029ee4470b4095d7f';

    this.props.loadMap({ id }).then(() => {
      if (this.props.errorMessage) {
        throw new SubmissionError({ _error: this.props.errorMessage });
      }

      console.log('-- this.props.map : ', this.props.map);
      this.setState({
        map: this.props.map,
      });
    });
  }


  updateMap = (map) => {
    console.log('-- updateMap map : ', map);
    this.props.updateMap(map).then(() => {
      if (this.props.errorMessage) {
        throw new SubmissionError({ _error: this.props.errorMessage });
      }

      console.log('-- updateMap this.props.map : ', this.props.map);
      this.setState({
        map: this.props.map,
      });
    });
  }


  render() {
    const { map } = this.props;

    return (
      <div>
        {(map != null)
          && (
          <MapEditor
            map={map}
            updateMap={this.updateMap.bind(this)}
            offset={{ x: 540, y: 200 }}
          />
          )
        }
      </div>

    );
  }
}

const mapStateToProps = state => ({
  map: getMap(state),
  isProcessing: getMapProcessing(state),
  errorMessage: getMapError(state),
  themeName: state.theme.className,
  rtl: state.rtl,
});

// export default compose(
//   // requireRole('user'),
//   connect(mapStateToProps, {
//     loadMap,
//     updateMap,
//   }),
// )(withTranslation('common')(MapEditorPage));


export default connect(mapStateToProps,{
  loadMap,
  updateMap,
  })
(withTranslation('common')(MapEditorPage));
