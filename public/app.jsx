var React = require('react');
var ReactDOM = require('react-dom');
var Categories = require('./categories.jsx');

var HelloMessage = React.createClass({
  render: function() {
    return <div>
      <Categories />
    </div>;
  }
});

ReactDOM.render(<HelloMessage name="John" />, document.querySelector('#mount-point'));
