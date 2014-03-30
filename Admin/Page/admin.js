/**
* CustomContactRelationshipTab extension admin screen logic. All HTML elements are created by this 
* JavaScript file. All data is queried and saved to server with Ajax so browser page is not refressed.
*/
cj(function ($) {
  'use strict';
  
  /*
  * All variables that used to save data queried from server.
  * All come from startInitDataAjaxLoading() Ajax call.
  * configRows in reloaded every time when configurations rows are created, edited or deleted.
  */
  var configRows;
  var customGroupForId;
  var customGroupsArray;
  var customGroupsForRelationshipTypeId;
  var relationshipTypeNameForId;
  var relationshipTypeArray;
  var customFieldsForCustomGroupId;
  var customFieldForId;
  var customFieldsArray;
  
  /*
  * Holds information about current edited configuration row:
  * old_relationship_type_id: original relationship tye before editing
  * old_custom_field_id: original custom field id before editing
  */
  var currentEdit = {};
  
  /**
  * Logic starting point. This is called when browser page is loaded.
  */
  function init() {
    startInitDataAjaxLoading();
  }
  
  /**
  * Start loading admin page init data from server with ajax. 
  * Calls initDataLoadComplete() when loading is complete.
  */
  function startInitDataAjaxLoading() {
    $.ajax({
      dataType: "json",
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/getInitData',
      success: initDataLoadComplete
    });
  }
  
  /**
  * Called when admin page init data has been loaded.
  * Saves init parameters and creates admin GUI controls.
  *
  * @param {object} result Ajax result
  */
  function initDataLoadComplete(result) {
    initVariables(result);
    createGUI();
  }
  
  /**
  * Saves and reorders init data variables. Maps (objects) and arrays are created to ease 
  * usage.
  *
  * @param {object} result Initdata loading Ajax result
  */
  function initVariables(initData) {
    //Relationsh types
    relationshipTypeNameForId = initData.relationshipTypes;
    relationshipTypeArray = $.map(initData.relationshipTypes, function (value, key) { return {id: key, label_a_b: value}; });
    
    //Custom groups
    customGroupForId = initData.customGroups;
    customGroupsArray = $.map(initData.customGroups, function (value, key) { return value; });
    customGroupsForRelationshipTypeId = {};
    $.each(customGroupsArray, function(index, customGroup) {
      if(!customGroupsForRelationshipTypeId.hasOwnProperty(customGroup.relationship_type_id)) {
        customGroupsForRelationshipTypeId[customGroup.relationship_type_id] = [];
      }
      customGroupsForRelationshipTypeId[customGroup.relationship_type_id].push(customGroup);
    });
    
    //Custom fields
    customFieldsArray = [];
    $.each(initData.customFieldsForCustomGroups, function(index, customFields) {
      var arr = $.map(customFields, function (value, key) { return value; });
      customFieldsArray = customFieldsArray.concat(arr);
    });
    customFieldsForCustomGroupId = {};
    $.each(customFieldsArray, function(index, customField) {
      if(!customFieldsForCustomGroupId.hasOwnProperty(customField.custom_group_id)) {
        customFieldsForCustomGroupId[customField.custom_group_id] = [];
      }
      customFieldsForCustomGroupId[customField.custom_group_id].push(customField);
    });
    customFieldForId = {};
    $.each(customFieldsArray, function(index, customField) {
      customFieldForId[customField.id] = customField;
    });
    
    //Config rows
    configRows = initData.config;
  }
  
  /**
  * Creates admin GUI HTML controls and inits DOM event listeners.
  */
  function createGUI() {
    var container = $('#customContactRelationshipsTabAdminContainer');
    
    //Create & add HTML to DOM
    container.append(createAddButton());
    container.append(createEditForm());
    container.append(createConfigTableContainer());
    
    //Init form data
    populateRelationshipTypeSelect();
    
    //Init event listeners
    $('#addNewButton').on('click', addButtonClicked);
    $('#saveFormButton').on('click', saveFormButtonClicked);
    $('#cancelButton').on('click', cancelButtonClicked);
    $('#relationship_type_id').on('change', relationshipTypeChanged);
    $('#custom_group_id').on('change', customGroupChanged);
    initTableEditLinkListeners();
  }
  
  /**
  * Init config rows table "Edit" and "Delete" click event listeners.
  * These needs to be recreated every time when table is reloaded & recreated.
  */
  function initTableEditLinkListeners() {
    var container = $('#customContactRelationshipsTabAdminContainer');
    container.find('.edit_link').on('click', configEditLinkClicked);
    container.find('.delete_link').on('click', configDeleteLinkClicked);
  }
  
  /**
  * Create "Add" button and container HTML.
  *
  * @return {string} HTML
  */
  function createAddButton() {
    var html = '<div id="customContactRelationshipsTabAdmin_addButtonContainer">';
    html += '<a class="button" href="#" id="addNewButton"><span><div class="icon add-icon"></div>Add</span></a>';
    html += '</div>';
    return html;
  }
  
  /**
  * Create configuration row edit & creation form HTML. Does not populate select-elements.
  *
  * @return {string} HTML
  */
  function createEditForm() {
    var html = '<div id="customContactRelationshipsTabAdmin_editFormContainer" class="crm-block crm-form-block" style="display: none;">';
    html += '<form>';
    html += '<table class="form-layout-compressed">';
    html += '<tbody>';
    
    html += '<tr>';
    html += '<td class="label"><label for="relationship_type_id">Relationship Type<span class="crm-marker" title="This field is required.">*</span></label></td>';
    html += '<td><select id="relationship_type_id" class="form-select required" name="relationship_type_id"></select></td>';
    html += '</tr>';
    
    html += '<tr>';
    html += '<td class="label"><label for="custom_group_id">Custom Group<span class="crm-marker" title="This field is required.">*</span></label></td>';
    html += '<td><select id="custom_group_id" class="form-select required" name="custom_group_id"></select></td>';
    html += '</tr>';
    
    html += '<tr>';
    html += '<td class="label"><label for="custom_field_id">Custom Field<span class="crm-marker" title="This field is required.">*</span></label></td>';
    html += '<td><select id="custom_field_id" class="form-select required" name="custom_field_id"></select></td>';
    html += '</tr>';
    
    html += '<tr>';
    html += '<td class="label"><label for="display_order">Display order<span class="crm-marker" title="This field is required.">*</span></label></td>';
    html += '<td><input id="display_order" class="form-text required" name="display_order" size="4" maxlength="4"/></td>';
    html += '</tr>';
    
    html += '</tbody>';
    html += '</table>';
    
    html += '<div class="crm-submit-buttons">';
    html += '<a class="button" href="#" id="saveFormButton"><span>Save</span></a>';
    html += '<a class="button" href="#" id="cancelButton"><span>Cancel</span></a>';
    html += '</div>';
    
    html += '</form>';
    html += '</div>';
    return html;
  }
  
  /**
  * Create configuration table DIV-container and table inside of it.
  *
  * @return {string} HTML
  */
  function createConfigTableContainer() {
    var html = '<div id="customContactRelationshipsTabAdmin_configTableContainer">';
    html += createConfigTable();
    html += '</div>';
    return html;
  }
  
  /**
  * Reloads all config rows from server with ajax. Calls callback parameter function 
  * with result JSON when loading is complete.
  *
  * @param {function} callback Callback function for Ajax
  */
  function reloadConfigAjax(callback) {
    $.ajax({
      dataType: "json",
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/getConfig',
      success: callback 
    });
  }
  
  /**
  * Update config table rows by first loading current situation from server with ajax and then 
  * recreating table HTML.
  */
  function updateConfigTable() {
    reloadConfigAjax(function(result) {
      configRows = result;
      $('#customContactRelationshipsTabAdmin_configTableContainer').html(createConfigTable());
      initTableEditLinkListeners();
    });
  }
  
  /**
  * Create configuration table HTML with rows.
  *
  * @return {string} HTML
  */
  function createConfigTable() {
    var html = '<table class="selector row-highlight">';
    
    //Table header
    html += '<thead>';
    html += ' <tr>';
    html += '  <th>Relationship Type</th>';
    html += '  <th>Custom Group</th>';
    html += '  <th>Custom Field</th>';
    html += '  <th>Display Order</th>';
    html += '  <th></th>';
    html += ' </tr>';
    html += '</thead>';
    
    //Table body
    html += '<tbody>';
    $.each(configRows, function(index, configRow) {
       html += createConfigTableRow(index, configRow);
    });
    html += '</tbody';
    
    html += '</table>';
    return html;
  }
  
  /**
  * Create configuration table row HTML.
  *
  * @param {int} index Row index. Used to add 'even' and 'odd' classes for rows.
  * @param {object} configRow Configuration row object displayed in this row.
  * @return {string} HTML
  */
  function createConfigTableRow(index, configRow) {
    var customField = customFieldForId[configRow.custom_field_id];
  
    var rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
    var html = '<tr class="' + rowClass + '">';
    html += ' <td>' + relationshipTypeNameForId[configRow.relationship_type_id] + '</td>';
    html += ' <td>' + customGroupForId[customField.custom_group_id].title + '</td>';
    html += ' <td>' + customField.label + '</td>';
    html += ' <td>' + configRow.display_order + '</td>';
    html += ' <td class="nowrap">';
    html += '  <a class="edit_link" href="#" data-relationship_type_id="' + configRow.relationship_type_id + '" data-custom_field_id="' + configRow.custom_field_id + '">Edit</a>';
    html += '  <a class="delete_link" href="#" data-relationship_type_id="' + configRow.relationship_type_id + '" data-custom_field_id="' + configRow.custom_field_id + '">Delete</a>';
    html += ' </td>';
    html+= '</tr>';
    return html;
  }
  
  /**
  * Find configuration row object for relationship type id and custom field id. 
  * These two fields are primary keys so there are always maximum of one result rows.
  *
  * @param {int} relationship_type_id Relationship type id
  * @param {int} custom_field_id Custom field id
  * @return {object} Configuration row object. Can be null. 
  */
  function getConfigRow(relationship_type_id, custom_field_id) {
    var result = null;
    $.each(configRows, function(index, configRow) {
      if(configRow.relationship_type_id == relationship_type_id && configRow.custom_field_id == custom_field_id) {
        result = configRow;
        return false;
      }
    });
    return result;
  }
  
  /**
  * Called when configuration row edit link is clicked.
  * Shows edit form and populates form inputs. Saved current edit info to 'currentEdit' variable.
  *
  * @param {object} eventObject jQuery click event object
  */
  function configEditLinkClicked(eventObject) {
    showEditForm();
    
    //Get clicked row info from link data parameters
    var link = $(eventObject.target);
    var relationship_type_id = link.data().relationship_type_id;
    var custom_field_id = link.data().custom_field_id;
    var configRow = getConfigRow(relationship_type_id, custom_field_id);
    
    //Save editing info to be used in form save
    currentEdit.old_relationship_type_id = relationship_type_id;
    currentEdit.old_custom_field_id = custom_field_id;
    
    $('#relationship_type_id').val(configRow.relationship_type_id);
    relationshipTypeChanged();
    $('#custom_group_id').val(configRow.custom_group_id);
    $('#custom_field_id').val(configRow.custom_field_id);
    $('#display_order').val(configRow.display_order);
  }
  
  /**
  * Called when configuration row delete link is clicked.
  * Asks confirmation from user and does ajax call to server to do the deletion.
  * Updated configuration table after deletion.
  *
  * @param {object} eventObject jQuery click event object
  */
  function configDeleteLinkClicked(eventObject) {
    if(!confirm("Delete row?")) {
      return;
    }
  
    //Get clicked row info from link data parameters
    var link = $(eventObject.target);
    var data = {
      relationship_type_id: link.data().relationship_type_id,
      custom_field_id: link.data().custom_field_id
    };
  
    $.ajax({
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/deleteConfigRow',
      data: data,
      success: function() {
        updateConfigTable();
      }
    });
  }
  
  /**
  * Called when add new configuration row button is clicked.
  * Shows configuration editing row.
  *
  * @param {object} eventObject jQuery click event object
  */
  function addButtonClicked(eventObject) {
    currentEdit = {};
    showEditForm();
  }
  
  /**
  * Called when configuration row form save button is clicked.
  * Validates and saves row to server.
  *
  * @param {object} eventObject jQuery click event object
  */
  function saveFormButtonClicked(eventObject) {
    saveConfigForm();
  }
  
  /**
  * Called when configuration row editing form cancel button is clicked.
  * Hides editing form.
  *
  * @param {object} eventObject jQuery click event object
  */
  function cancelButtonClicked(eventObject) {
    hideEditForm();
  }
  
  /**
  * Shows configuration editing form.
  * Hides Add button and clears all old validation error messages.
  */
  function showEditForm() {
    $('#addNewButton').hide();
    $('#customContactRelationshipsTabAdmin_editFormContainer').show();
    
    clearValidationErrors();
    clearServerErrorMessage();
  }
  
  /**
  * Hides configuration editing form and shows Add button.
  */
  function hideEditForm() {
    $('#customContactRelationshipsTabAdmin_editFormContainer').hide();
    $('#addNewButton').show();
  }
  
  /**
  * Called when selected relationship type is changed in form select element.
  * Populates custom group select.
  */
  function relationshipTypeChanged() {
    var relationshipTypeId = $('#relationship_type_id option:selected').val();
    populateCustomGroupSelect(relationshipTypeId);
    customGroupChanged();
  }
  
  /**
  * Called when selected custom group is changed in form select element.
  * Populates custom field select.
  */
  function customGroupChanged() {
    var customGroupId = $('#custom_group_id option:selected').val();
    populateCustomFieldSelect(customGroupId);
  }
  
  /**
  * Populates Relationship type select element. Creates option elements HTML 
  * and injects it inside select element.
  */
  function populateRelationshipTypeSelect() {
    var html = '';
    $.each(relationshipTypeArray, function(index, relationshipType) {
      html += '<option ';
      html += 'value="' + relationshipType.id + '">';
      html += relationshipType.label_a_b
      html += '</option>';
    });
    $('#relationship_type_id').html(html);
  }
  
  /**
  * Populates custom group select element. Creates option elements HTML 
  * and injects it inside select element. Displayed custom groups belong 
  * to relationship type given by parameter.
  *
  * @param {int} relationshipTypeId Relationship type id.
  */
  function populateCustomGroupSelect(relationshipTypeId) {
    var html = '';
    if(customGroupsForRelationshipTypeId.hasOwnProperty(relationshipTypeId)) {
      $.each(customGroupsForRelationshipTypeId[relationshipTypeId], function(index, customGroup) {
        html += '<option ';
        html += 'value="' + customGroup.id + '">';
        html += customGroup.title
        html += '</option>';
      });
    }
    $('#custom_group_id').html(html);
  }
  
  /**
  * Populates custom field select element. Creates option elements HTML 
  * and injects it inside select element. Displayed custom field belong 
  * to custom group given by parameter.
  *
  * @param {int} customGroupId Custom group id.
  */
  function populateCustomFieldSelect(customGroupId) {
    var html = '';
    if(customFieldsForCustomGroupId.hasOwnProperty(customGroupId)) {
      $.each(customFieldsForCustomGroupId[customGroupId], function(index, customField) {
        html += '<option ';
        html += 'value="' + customField.id + '">';
        html += customField.label
        html += '</option>';
      });
    }
    $('#custom_field_id').html(html);
  }
  
  /**
  * Save configuration edit form data to server.
  * Validates that inputs are not empty. Shows validation error if data is invalid for saving.
  * Saving is done with ajax. Possible error message from server are displayed in form.
  * Form is closed only if saving was succesfull. Configuration table is reloaded and recrated after 
  * succesfull saving.
  */
  function saveConfigForm() {
    clearValidationErrors();
    clearServerErrorMessage();
    
    //Validate data
    var data = getFormData();
    var hasErrors = false;
    if(isNaN(parseInt(data.relationship_type_id))) {
      showValidationError('relationship_type_id', 'This field is required.');
      hasErrors = true;
    }
    if(isNaN(parseInt(data.custom_group_id))) {
      showValidationError('custom_group_id', 'This field is required.');
      hasErrors = true;
    }
    if(isNaN(parseInt(data.custom_field_id))) {
      showValidationError('custom_field_id', 'This field is required.');
      hasErrors = true;
    }
    if(data.display_order.length === 0) {
      showValidationError('display_order', 'This field is required.');
      hasErrors = true;
    }
    
    if(hasErrors) {
      return;
    }
  
    $.ajax({
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/saveConfigRow',
      data: data,
      success: function(result) {
        if(result != 'ok') {
          showServerErrorMessage(result);
        }
        else {
          updateConfigTable();
          hideEditForm();
        }
      }
    });
  }
  
  /**
  * Get all configuration row form input data and also data from 'currentEdit' variable.
  *
  * @return {object} Form data
  */
  function getFormData() {
    return {
      relationship_type_id: $('#relationship_type_id').val(),
      custom_group_id: $('#custom_group_id').val(),
      custom_field_id: $('#custom_field_id').val(),
      display_order: $('#display_order').val(),
      old_relationship_type_id: currentEdit.old_relationship_type_id,
      old_custom_field_id: currentEdit.old_custom_field_id
    };
  }
  
  /**
  * Show form save error message from server in form.
  *
  * @param {string} message Error message
  */
  function showServerErrorMessage(message) {
    $('#customContactRelationshipsTabAdmin_editFormContainer .crm-submit-buttons').append('<label class="crm-inline-error">' + message + '</label>');
  }
  
  /**
  * Removes possible server error message from edit form.
  */
  function clearServerErrorMessage() {
    $('#customContactRelationshipsTabAdmin_editFormContainer .crm-submit-buttons .crm-inline-error').remove();
  }
  
  /**
  * Show form save validation error message in form bu highlighting field and adding erro message next to it.
  *
  * @param {string} fieldId Field id for element with invalid data
  * @param {string} message Error message
  */
  function showValidationError(fieldId, message) {
    var field = $('#'+fieldId);
    var messageLabelHtml = '<label class="crm-inline-error">' + message + '</label>';
    field.parent().append(messageLabelHtml);
    
    field.addClass('error crm-inline-error');
  }
  
  /**
  * Removes all form validation errors.
  */
  function clearValidationErrors() {
    clearValidationError('relationship_type_id');
    clearValidationError('custom_group_id');
    clearValidationError('custom_field_id');
    clearValidationError('display_order');
  }
  
  /**
  * Removes field validation error for field.
  *
  * @param {string} fieldId Field id for element with error message
  */
  function clearValidationError(fieldId) {
    var field = $('#'+fieldId);
    field.parent().find('label.crm-inline-error').remove();
    field.removeClass('error crm-inline-error');
  }
  
  //Start logic
  init();
});