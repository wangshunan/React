import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import NameCard from './compoments/NameCard';
import LikesButton from './compoments/LikesButton';
import DigitalClock from './compoments/DigitalClock';
import CommentBox from './compoments/CommentBox';
import CommentList from './compoments/CommentList';

const tags = ['dragon', 'boy']
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      comments: ['this is my first reply']
    }

    this.addComment = this.addComment.bind(this)
  }

  addComment(comment) {
    this.setState({
      comments: [...this.state.comments, comment]
    })
  }

  render() {
    const { comments } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
          className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <CommentList comments={comments} />
        <CommentBox 
          commentsLength={comments.length}
          onAddComment={this.addComment}
        />
      </div>
    );
  }
}

export default App;
