var React = require('react');
var $     = require('jquery');
var CategoryEntry = require('./categoryEntry.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      error: false,
      categories: [],
      activeCategoryEntry: -1
    };
  },

  componentDidMount: function() {
    $.get('/categories')
      .error(this.onError)
      .success(this.onDataLoaded);
  },

  onDataLoaded: function(data) {
    var categories = {};
    data.categories.forEach(function(c) {
      if (categories[c.category]) {
        categories[c.category].push({
          link: '/' + c.category + '/' + c.main_category,
          title: c.main_category === 1 ? 'Books' : 'Kindle'
        });
      } else {
        categories[c.category] = [{
          link: '/' + c.category + '/' + c.main_category,
          title: c.main_category === 1 ? 'Books' : 'Kindle'
        }];
      }
    });

    this.setState({
      categories: categories
    });
  },

  onError: function() {
    this.setState({
      error: true
    });
  },

  onCategoryExpand: function(id) {
    this.setState({
      activeCategoryEntry: id
    });
  },

  renderEntry: function(c, idx) {
    return <CategoryEntry
              name={c}
              key={idx}
              id={idx}
              types={this.state.categories[c]}
              onCategoryExpand={this.onCategoryExpand}
              active={idx === this.state.activeCategoryEntry} />;
  },

  renderCategories: function() {
    return Object.keys(this.state.categories).map(this.renderEntry);
  },

  render: function() {
    return <div className="category-container">
      <h2>SciFi Books in Kindle and Hard Cover version</h2>
      <ul>
      {this.renderCategories()}
  </ul>
  </div>;
  }
});
