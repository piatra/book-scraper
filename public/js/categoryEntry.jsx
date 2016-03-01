var React = require("react");
var $     = require("jquery");

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
      name: "N/A",
      types: [],
      active: false
    };
  },

  getInitialState: function() {
    return {
      books: []
    };
  },

  sortFn: function(a, b) {
    return a.rank - b.rank;
  },

  onDataLoaded: function(data) {
    this.props.onCategoryExpand(this.props.id);

    this.setState({
      books: data.books.sort(this.sortFn)
    });
  },

  loadBooks: function(href, e) {
    e.preventDefault();
    $.get(href)
      .error(this.onError)
      .success(this.onDataLoaded);

    return false;
  },

  renderBooks: function() {
    if (this.props.active) {
      return <ul>
        {this.state.books.map(function(b) {
          return <li><b>{b.title}</b> by {b.author}</li>;
        })}
      </ul>;
    }
  },

  render: function() {
    return <li className="category-container__entry">
      {this.props.name}
      {this.props.types.map(function(v) {
        var cb = this.loadBooks.bind(this, v.link);
        return <a href={v.link} onClick={cb}>
          ({v.title})
        </a>;
      }.bind(this))}
      {this.renderBooks()}
    </li>;
  }
});
