import ReactDOM from "react-dom";
import React, { Component } from "react";

import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import { ThemeProvider } from "./react-components/styles/theme";
// import { store } from "./utils/store-instance";
import { getStore } from "./utils/store-instance";

import configs from "./utils/configs";
import styles from "./assets/stylesheets/intrometa.scss";

import { ReactComponent as PeopleIcon } from "./react-components/icons/People.svg";

class IntroMetaPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicMathRooms: [],
      publicScienceRooms: [],
      publicEngineeringRooms: []
    };
  }

  getReticulumFetchUrl(path) {
    return `https://${configs.RETICULUM_SERVER}${path}`;
  }

  async getPublicRooms() {
    const url = this.getReticulumFetchUrl("/api/v1/media/search?source=rooms&category=intrometa");
    const params = {
      headers: { "content-type": "application/json" },
      method: "GET"
    };
    let result = null;
    /*
    const resp = await fetch(url, params);
    const resultText = await resp.text();
    result = JSON.parse(resultText);
    */
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
    const imageAspect = 391; // images.preview.width / images.preview.height;
    const thumbnailUrl = images.preview.url;
    const thumbnailWidth = Math.floor(Math.max(imageAspect * imageHeight, imageHeight * 0.85));
    const thumbnailHeight = imageHeight;
    return [thumbnailUrl, thumbnailWidth, thumbnailHeight];
  }

  sortOrder(array) {
    return Array.from(array).sort((a, b) => {
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      if (a.order === b.order) return 0;
    });
  }

  componentDidMount() {
    const run = async () => {
      await this.getPublicRooms().then(res => {
        //console.log("result : ", res);
        const publicRooms = [];
        res.entries.forEach((room) => {
          if (room.room_data != "") {
            const roomData = room.room_data;
            let roomInfoJson = null;
            try {
              roomInfoJson = JSON.parse(roomData);
            } catch (e) {
              roomInfoJson = null;
            }

            if (roomInfoJson != null) {
              if (roomInfoJson.visible) {
                room.order = roomInfoJson.order;
                room.type = roomInfoJson.type;
                room.name = roomInfoJson.name;
                publicRooms.push(room);
              }
            }
          }
        });
        //console.log("publicRooms : ", publicRooms);

        /*
        // Room Order Sort 
        const sortedPublicRooms = Array.from(publicRooms).sort((a, b) => {
          if(a.order > b.order) return 1;
          if(a.order < b.order) return -1;
          if(a.order === b.order) return 0;
        });
        */
        /*
        // Room Name Sort 
        const sortedPublicRooms = Array.from(publicRooms).sort((a, b) => {
          const upperCaseA = a.name.toUpperCase();
          const upperCaseB = b.name.toUpperCase();
          
          if(upperCaseA > upperCaseB) return 1;
          if(upperCaseA < upperCaseB) return -1;
          if(upperCaseA === upperCaseB) return 0;
        });
        */
        //console.log("sortedPublicRooms : ", sortedPublicRooms);

        // Type Separation
        let publicMathRooms = [];
        let publicScienceRooms = [];
        let publicEngineeringRooms = [];
        //let publicEngineeringRooms = [{"description": "{\"order\":301, \"type\":\"Engineering\", \"name\":\"밀링 실습실\", \"visible\":true}", "id": "", "images": {"preview": {"url": "https://meta1.teacherville.co.kr/files/e038a3e4-5e77-4148-a997-f0e224433c81.png"}}, "lobby_count": -1, "member_count": -1, "name": "밀링 실습실", "room_size": 24, "scene_id": "", "type": "Engineering", "url": "https://webglmulti.web.app", "user_data": null, "order": 301},
        //{"description": "{\"order\":302, \"type\":\"Engineering\", \"name\":\"선반 실습실\", \"visible\":true}", "id": "", "images": {"preview": {"url": "https://meta1.teacherville.co.kr/files/7dbb219e-fcda-4fa3-9778-e0823b7c0e4f.png"}}, "lobby_count": -1, "member_count": -1, "name": "선반 실습실", "room_size": 24, "scene_id": "", "type": "Engineering", "url": "https://webglmulti.web.app/Lathe", "user_data": null, "order": 302}];
        publicRooms.forEach((room) => {
          if (room.type.toUpperCase() == "MATH") {
            publicMathRooms.push(room);
          } else if (room.type.toUpperCase() == "SCIENCE") {
            publicScienceRooms.push(room);
          } else if (room.type.toUpperCase() == "ENGINEERING") {
            publicEngineeringRooms.push(room);
          }
        });

        // Sort
        if (publicMathRooms.length == 0) {
          publicMathRooms = null;
        } else {
          publicMathRooms = this.sortOrder(publicMathRooms);
        }
        if (publicScienceRooms.length == 0) {
          publicScienceRooms = null;
        } else {
          publicScienceRooms = this.sortOrder(publicScienceRooms);
        }
        if (publicEngineeringRooms.length == 0) {
          publicEngineeringRooms = null;
        } else {
          publicEngineeringRooms = this.sortOrder(publicEngineeringRooms);
        }

        // State
        this.setState({ publicMathRooms: publicMathRooms });
        this.setState({ publicScienceRooms: publicScienceRooms });
        this.setState({ publicEngineeringRooms: publicEngineeringRooms });
      });
    }
    run();
  }

  componentDidUpdate() { };

  render() {
    const store = getStore();
    return (
      <WrappedIntlProvider>
        <ThemeProvider store={store}>
          <div className={styles.roomHeader}>
            <img src="https://meta2.teacherville.co.kr/files/2c473505-c40f-41a1-ac4b-43595620c05a.jpg" />
          </div>
          <div className={styles.roomsContainer}>
            <div className={styles.roomsContainerInner}>
              <div className={styles.roomsContainerHeader}>
                <h2 className={styles.roomsContainerTitle}>수학</h2>
              </div>
              <div className={styles.roomsContainerBody}>
                {this.state.publicMathRooms == null && (
                  <span>룸이 없습니다.</span>
                )}
                {this.state.publicMathRooms !== null && this.state.publicMathRooms.length == 0 && (
                  <span>로딩중...</span>
                )}
                {this.state.publicMathRooms !== null && this.state.publicMathRooms.length > 0 && (
                  <div className={styles.roomsChannels}>
                    {this.state.publicMathRooms.map(room => {
                      const [thumbnailUrl, thumbnailWidth, thumbnailHeight] = this.getThumbnail(room.images);
                      return (
                        <div className={styles.roomsChannel}>
                          <div className={styles.roomsPreview}>
                            <a className={styles.thumbnailLink} href={room.url}>
                              <img src={thumbnailUrl} alt={room.name} width={thumbnailWidth} height={thumbnailHeight} id={room.order} />
                            </a>
                            {room.member_count !== undefined && room.member_count >= 0 && (
                              <div className={styles.roomsMemberCount}>
                                <PeopleIcon /> <span>{room.member_count}</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.roomsTitle}>
                            <b>{room.name}</b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.roomsContainer}>
            <div className={styles.roomsContainerInner}>
              <div className={styles.roomsContainerHeader}>
                <h2 className={styles.roomsContainerTitle}>과학</h2>
              </div>
              <div className={styles.roomsContainerBody}>
                {this.state.publicScienceRooms == null && (
                  <span>룸이 없습니다.</span>
                )}
                {this.state.publicScienceRooms !== null && this.state.publicScienceRooms.length == 0 && (
                  <span>로딩중...</span>
                )}
                {this.state.publicScienceRooms !== null && this.state.publicScienceRooms.length > 0 && (
                  <div className={styles.roomsChannels}>
                    {this.state.publicScienceRooms.map(room => {
                      const [thumbnailUrl, thumbnailWidth, thumbnailHeight] = this.getThumbnail(room.images);
                      return (
                        <div className={styles.roomsChannel}>
                          <div className={styles.roomsPreview}>
                            <a className={styles.thumbnailLink} href={room.url}>
                              <img src={thumbnailUrl} alt={room.name} width={thumbnailWidth} height={thumbnailHeight} id={room.order} />
                            </a>
                            {room.member_count !== undefined && room.member_count >= 0 && (
                              <div className={styles.roomsMemberCount}>
                                <PeopleIcon /> <span>{room.member_count}</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.roomsTitle}>
                            <b>{room.name}</b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.roomsContainer}>
            <div className={styles.roomsContainerInner}>
              <div className={styles.roomsContainerHeader}>
                <h2 className={styles.roomsContainerTitle}>공학</h2>
              </div>
              <div className={styles.roomsContainerBody}>
                {this.state.publicEngineeringRooms == null && (
                  <span>룸이 없습니다.</span>
                )}
                {this.state.publicEngineeringRooms !== null && this.state.publicEngineeringRooms.length == 0 && (
                  <span>로딩중...</span>
                )}
                {this.state.publicEngineeringRooms !== null && this.state.publicEngineeringRooms.length > 0 && (
                  <div className={styles.roomsChannels}>
                    {this.state.publicEngineeringRooms.map(room => {
                      const [thumbnailUrl, thumbnailWidth, thumbnailHeight] = this.getThumbnail(room.images);
                      return (
                        <div className={styles.roomsChannel}>
                          <div className={styles.roomsPreview}>
                            <a className={styles.thumbnailLink} href={room.url}>
                              <img src={thumbnailUrl} alt={room.name} width={thumbnailWidth} height={thumbnailHeight} id={room.order} />
                            </a>
                            {room.member_count !== undefined && room.member_count >= 0 && (
                              <div className={styles.roomsMemberCount}>
                                <PeopleIcon /> <span>{room.member_count}</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.roomsTitle}>
                            <b>{room.name}</b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <div>
              <div>
                <img src="https://meta2.teacherville.co.kr/files/f1c3c222-275c-4fb6-9666-edcc5edb253e.png" alt="" width="130" />
                <span>
                  테크빌교육(주) 에듀테크 연구소<br />
                  06138 서울특별시 강남구 언주로 551 프라자빌딩 5, 6, 8층(역삼동 654-3) / 대표번호 : 02-3442-7783 / 문의메일 : space67@tekville.com
                </span>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </WrappedIntlProvider>
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<IntroMetaPage />, document.getElementById("ui-root"));
});

