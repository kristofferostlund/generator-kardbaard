'use strict'

import <%= nameCapitalized %> from './<%= name %>.db';
import config from '../../config';
import utils from '../../utils/utils';

// Initialize the <%= name %> table
<%= nameCapitalized %>.initialize();

/**
 * Route: GET '/api/<%= name %>s/'
 */
export const index = (req, res) => {
  // Get the top and page for pagination
  let {top, page} = req.query;

  <%= nameCapitalized %>.find(top, page)
  .then((<%= name %>s) => res.status(200).json(<%= name %>s))
  .catch((err) => utils.handleError(res, err));
}

/**
 * Route: GET '/api/<%= name %>s/:id'
 */
export const show = (req, res) => {
  // Get the id
  let {id} = req.params;

  <%= nameCapitalized %>.findById(id)
  .then((<%= name %>) => res.status(200).json(<%= name %>))
  .catch((err) => utils.handleError(res, err));
}

/**
 * Route: POST '/api/<%= name %>s/'
 */
export const create = (req, res) => {
  // Get the <%= name %>
  let _<%= name %> = req.body;

  <%= nameCapitalized %>.create(_<%= name %>)
  .then((<%= name %>) => res.status(200).json(<%= name %>))
  .catch((err) => utils.handleError(res, err));
}

/**
 * Route: PUT '/api/<%= name %>s/:id'
 */
export const update = (req, res) => {
  // Get the id and <%= name %>
  let {id} = req.params;
  let _<%= name %> = req.body;

  <%= nameCapitalized %>.update(id, _<%= name %>)
  .then((<%= name %>) => res.status(200).json(<%= name %>))
  .catch((err) => utils.handleError(res, err));
}

/**
 * Route: DELETE '/api/<%= name %>s/:id'
 */
export const remove = (req, res) => {
  // Get the id
  let {id} = req.params;

  <%= nameCapitalized %>.remove(id)
  .then(() => res.status(201).send('No Content'))
  .catch((err) => utils.handleError(res, err));
}

export default {
  index: index,
  show: show,
  create: create,
  update: update,
  remove: remove,
}
