/*
  ArticleShape.js

  This provides a PropTypes shape descriptor of article objects. This is pulled out
  since multiple components take articles as props.
*/

import PropTypes from "prop-types";

const ArticleShape = PropTypes.shape({
  title: PropTypes.string,
  contents: PropTypes.string,
  edited: PropTypes.string,
});

export default ArticleShape;
