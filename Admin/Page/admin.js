cj(function ($) {
  'use strict';
  
  var configRows;
  var customGroupForId;
  var customGroupsArray;
  var customGroupsForRelationshipTypeId;
  var relationshipTypeNameForId;
  var relationshipTypeArray;
  var customFieldsForCustomGroupId;
  var customFieldForId;
  var customFieldsArray;
  var currentEdit = {};
  
  function init() {
    startInitDataAjaxLoading();
  }
  
  function startInitDataAjaxLoading() {
    $.ajax({
      dataType: "json",
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/getInitData',
      success: initDataLoadComplete
    });
  }
  
  function initDataLoadComplete(result) {
    initVariables(result);
    createGUI();
  }
  
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
  
  function createGUI() {
    var container = $('#customContactRelationshipsTabAdminContainer');
    
    //Create & add HTML to DOM
    container.append(createAddButton());
    container.append(createEditForm());
    container.append(createConfigTableContainer());
    
    //Init form data
    populateRelationshipTypeSelect();
    
    //Init listeners
    $('#addNewButton').on('click', addButtonClicked);
    $('#saveFormButton').on('click', saveFormButtonClicked);
    $('#cancelButton').on('click', cancelButtonClicked);
    $('#relationship_type_id').on('change', relationshipTypeChanged);
    $('#custom_group_id').on('change', customGroupChanged);
    initTableEditLinkListeners();
  }
  
  function initTableEditLinkListeners() {
    var container = $('#customContactRelationshipsTabAdminContainer');
    container.find('.edit_link').on('click', configEditLinkClicked);
    container.find('.delete_link').on('click', configDeleteLinkClicked);
  }
  
  function createAddButton() {
    var html = '<div id="customContactRelationshipsTabAdmin_addButtonContainer">';
    html += '<a class="button" href="#" id="addNewButton"><span><div class="icon add-icon"></div>Add</span></a>';
    html += '</div>';
    return html;
  }
  
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
  
  function createConfigTableContainer() {
    var html = '<div id="customContactRelationshipsTabAdmin_configTableContainer">';
    html += createConfigTable();
    html += '</div>';
    return html;
  }
  
  function reloadConfigAjax(callback) {
    $.ajax({
      dataType: "json",
      url: 'index.php?q=civicrm/customContactRelationshipsTab/settings/ajax/getConfig',
      success: callback 
    });
  }
  
  function updateConfigTable() {
    reloadConfigAjax(function(result) {
      configRows = result;
      $('#customContactRelationshipsTabAdmin_configTableContainer').html(createConfigTable());
      initTableEditLinkListeners();
    });
  }
  
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
  
  function configEditLinkClicked(eventObject) {
    showEditForm();
    
    var link = $(eventObject.target);
    var relationship_type_id = link.data().relationship_type_id;
    var custom_field_id = link.data().custom_field_id;
    var configRow = getConfigRow(relationship_type_id, custom_field_id);
    
    currentEdit.old_relationship_type_id = relationship_type_id;
    currentEdit.old_custom_field_id = custom_field_id;
    
    $('#relationship_type_id').val(configRow.relationship_type_id);
    relationshipTypeChanged();
    $('#custom_group_id').val(configRow.custom_group_id);
    $('#custom_field_id').val(configRow.custom_field_id);
    $('#display_order').val(configRow.display_order);
  }
  
  function configDeleteLinkClicked(eventObject) {
    if(!confirm("Delete row?")) {
      return;
    }
  
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
  
  function addButtonClicked(eventObject) {
    currentEdit = {};
    showEditForm();
  }
  
  function saveFormButtonClicked(eventObject) {
    saveConfigForm();
  }
  
  function cancelButtonClicked(eventObject) {
    hideEditForm();
  }
  
  function showEditForm() {
    $('#addNewButton').hide();
    $('#customContactRelationshipsTabAdmin_editFormContainer').show();
    
    clearValidationErrors();
    clearServerErrorMessage();
  }
  
  function hideEditForm() {
    $('#customContactRelationshipsTabAdmin_editFormContainer').hide();
    $('#addNewButton').show();
  }
  
  function relationshipTypeChanged() {
    var relationshipTypeId = $('#relationship_type_id option:selected').val();
    populateCustomGroupSelect(relationshipTypeId);
    customGroupChanged();
  }
  
  function customGroupChanged() {
    var customGroupId = $('#custom_group_id option:selected').val();
    populateCustomFieldSelect(customGroupId);
  }
  
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
  
  function saveConfigForm() {
    clearValidationErrors();
    clearServerErrorMessage();
    
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
  
  function showServerErrorMessage(message) {
    $('#customContactRelationshipsTabAdmin_editFormContainer .crm-submit-buttons').append('<label class="crm-inline-error">' + message + '</label>');
  }
  
  function clearServerErrorMessage() {
    $('#customContactRelationshipsTabAdmin_editFormContainer .crm-submit-buttons .crm-inline-error').remove();
  }
  
  function showValidationError(fieldId, message) {
    var field = $('#'+fieldId);
    var messageLabelHtml = '<label class="crm-inline-error">' + message + '</label>';
    field.parent().append(messageLabelHtml);
    
    field.addClass('error crm-inline-error');
  }
  
  function clearValidationErrors() {
    clearValidationError('relationship_type_id');
    clearValidationError('custom_group_id');
    clearValidationError('custom_field_id');
    clearValidationError('display_order');
  }
  
  function clearValidationError(fieldId) {
    var field = $('#'+fieldId);
    field.parent().find('label.crm-inline-error').remove();
    field.removeClass('error crm-inline-error');
  }
  
  init();
});