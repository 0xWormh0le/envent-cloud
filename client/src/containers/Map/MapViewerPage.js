import React from 'react';

// custom component

// redux
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { compose } from 'redux';
import MapViewer from '../../shared/components/MapComponent/MapViewer';
import requireRole from '../../hoc/requireRole';
import {
  getMapProcessing, getMapError, getMap,
} from '../../redux/selectors';
import {
  loadMap,
  updateMap,
} from '../../redux/actions/map.actions';
import {withTranslation} from "react-i18next";


class MapViewerPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      map: this.props.map,
      speed: 40,
      map_scale: 1,
    };
  }


  componentDidMount() {
    this.loadMap();
  }


  loadMap = () => {
    const { id } = this.props.match.params;
    console.log('-- id : ', id);

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

  onMapScaleChange = (value) => {
    this.setState({
      map_scale: value,
    });
  }

  onWalkSpeedChange = (value) => {
    this.setState({
      speed: value,
    });
  }


  render() {
    const { map } = this.props;

    return (
      <div>
        {(map != null)
          && (
          <MapViewer
            map={map}
            offset={{ x: 540, y: 200 }}
            speed={this.state.speed}
            map_scale={this.state.map_scale}
            onScaleChange={this.onMapScaleChange.bind(this)}
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
//   requireRole('user'),
//   connect(mapStateToProps, {
//     loadMap,
//     updateMap,
//   }),
// )(MapViewerPage);

export default connect(mapStateToProps,{
  loadMap,
  updateMap,
})
(withTranslation('common')(MapViewerPage));

