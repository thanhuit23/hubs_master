import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import { ThemeProvider } from "./react-components/styles/theme";
import { store } from "./utils/store-instance";

import configs from "./utils/configs";
import styles from "./assets/stylesheets/category.scss";

import { AuthContextProvider, AuthContext } from "./react-components/auth/AuthContext";

import { ReactComponent as PeopleIcon } from "./react-components/icons/People.svg";

class CategoryPage extends Component {
  static contextType = AuthContext;

  static propTypes = {
    category: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      category: "",
      rooms: []
    };
  }

  getReticulumFetchUrl(path) {
    return `https://${configs.RETICULUM_SERVER}${path}`;
  }
  
  async getRooms(categoey) {
    const url = this.getReticulumFetchUrl(`/api/v1/media/search?source=rooms&category=${categoey}`);
    const params = {
      headers: {"content-type": "application/json"},
      method: "GET"
    };
    let result = null;
    await fetch(url, params).then(async resp => {
      const resultText = await resp.text();
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        result = null;
      }
    });
    return result;
  }

  getThumbnail(images) {
    const imageHeight = 220;
    const imageAspect = 391;
    const thumbnailUrl = images.preview.url;
    const thumbnailWidth = Math.floor(Math.max(imageAspect * imageHeight, imageHeight * 0.85));
    const thumbnailHeight = imageHeight;
    return [thumbnailUrl, thumbnailWidth, thumbnailHeight];
  }

  componentDidMount() {
    const run = async() => {
      this.setState({category: this.props.category});
      await this.getRooms(this.props.category).then(res => {
        //console.log("result: ", res);
        const rooms = [];
        res.entries.forEach((room) => {
          room.spoke_url = this.getReticulumFetchUrl(`/spoke/projects/${room.project_id}`);
          rooms.push(room);
        });
        this.setState({rooms: rooms});
      });
    }
    run();
  }

  render() {
    return (
      <div className={styles.roomsContainer}>
        <div className={styles.roomsContainerHeader}>
          <h2 className={styles.roomsContainerTitle}>{this.props.category} Room</h2>
        </div>
        <div className={styles.roomsContainerInner}>
          <div className={styles.roomsContainerBody}>
            {this.state.rooms !== null && this.state.rooms.length == 0 && (
              <span>룸이 없습니다.</span>
            )}
            {this.state.rooms !== null && this.state.rooms.length > 0 && (
              <div className={styles.roomsChannels}>
                {this.state.rooms.map(room => {
                  const [thumbnailUrl, thumbnailWidth, thumbnailHeight] = this.getThumbnail(room.images);
                  return (
                    <div className={styles.roomsChannel}>
                      <div className={styles.roomsPreview}>
                        <a className={styles.thumbnailLink} href={room.url}>
                          <img src={thumbnailUrl} alt={room.name} width={thumbnailWidth} height={thumbnailHeight} id={room.id} />
                        </a>
                        {room.member_count !== undefined && room.member_count >= 0 && (
                          <div className={styles.roomsMemberCount}>
                            <PeopleIcon /> <span>{room.member_count}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.roomsTitle}>
                        <span>{room.name}</span>
                        {configs.feature("enable_spoke") && (
                          <a href={room.spoke_url}>
                            edit
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function Root(props) {
  return (
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <AuthContextProvider store={store}>
          <CategoryPage category={props.category}/>
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const category = document.location.pathname.substring(1).split("/")[1];
  //console.log(`category: ${category}`);

  ReactDOM.render(
    <Root category={category} />, document.getElementById("ui-root")
  );
});

