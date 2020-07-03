import React from 'react';

const Event = (props) => {
    return(
    <div className="event-div">
        <p>User id: {props.event.userid}</p>
        <p>Restaurant id: {props.event.restid}</p>
        <p>Date: {props.event.time}</p>
    </div>
    );
}

export default Event;