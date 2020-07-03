import React from 'react';
import Event from '../components/Events/Event';

class Feed extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            events: [],
            uid: props.match.params.userID
        }
    }
    
    //useEffect with empty array as second arg is equivalent to ComponentDidMount
    componentDidMount(){
        console.log("Fetching with " + this.state.uid);
        fetch(`/api/event/byuser/${this.state.uid}`)
                    .then( res => res.json())
                    .then( res => this.setState({events: res.items}) )
                    .catch( err => console.error(err) );
    };

    render(){
        console.log("Rendering with array: " + this.state.events);
        return(
        <div className="feed-wrapper">
            {this.state.events.length > 0 && 
             this.state.events.map((eventobject => <Event event={eventobject} key={Math.random()*10000}/>))}
        </div>
        );
    }
    
}

export default Feed;