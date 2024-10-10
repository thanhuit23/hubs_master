import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { WebGLContentModal } from "./WebGLContentModal";

export function WebGLContentModalContainer({ scene, url, onClose }) {    
    // const endpoint = 'http://metatrack_xapi.tubeai.co.kr/xApi/';
    const endpoint = 'https://melissa-albania-sides-joe.trycloudflare.com/';
    // const initialRequestURL = 'eventdata/practice/initialized';
    const initialRequestURL = 'initialized';
    // const terminateRequestURL = 'eventdata/practice/terminated';
    const terminateRequestURL = 'terminated';
    // Global variables to store URL parameters
    let urlParams = {};
    getUrlParams();
    urlParams['startTime'] = new Date().toISOString();
    const input = {
        homepage: urlParams['homepage'] ? urlParams['homepage'] : '',
        userId: urlParams['userId'] ? urlParams['userId'] : '',
        courseId: urlParams['courseId'] ? urlParams['courseId'] : '',
        sessionId: urlParams['sessionId'] ? urlParams['sessionId'] : '',
        contentId: urlParams['contentId'] ? urlParams['contentId'] : '',
        contentName: urlParams['contentName'] ? urlParams['contentName'] : '',
        duration: '',
    }
    sendPostRequest(endpoint + initialRequestURL, input);

    const handleClose = useCallback(() => {
        console.log("User closed the iframe");
        // Send to API
        urlParams['endTime'] = new Date().toISOString();
        urlParams['duration'] = (new Date(urlParams['endTime']) - new Date(urlParams['startTime'])) / 1000;
        // Convert duration to string
        urlParams['duration'] = urlParams['duration'].toString();
        const input = {
            homepage: urlParams['homepage'] ? urlParams['homepage'] : '',
            userId: urlParams['userId'] ? urlParams['userId'] : '',
            courseId: urlParams['courseId'] ? urlParams['courseId'] : '',
            sessionId: urlParams['sessionId'] ? urlParams['sessionId'] : '',
            contentId: urlParams['contentId'] ? urlParams['contentId'] : '',
            contentName: urlParams['contentName'] ? urlParams['contentName'] : '',
            duration: urlParams['duration'] ? urlParams['duration'] : '',
        }
        sendPostRequest(endpoint + terminateRequestURL, input);
        onClose();
    }, [onClose]);

    return <WebGLContentModal onClose={handleClose} url={url} />;
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        urlParams[key] = value;
    });
}

function sendPostRequest(serverUrl, input) {
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(
            {
                homepage: input.homepage,
                userId: input.userId,
                courseId: input.courseId,
                sessionId: input.sessionId,
                contentId: input.contentId,
                contentName: input.contentName,
                duration: input.duration,
            })
    })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
}

WebGLContentModalContainer.propTypes = {
    scene: PropTypes.object.isRequired,
    onClose: PropTypes.func
};