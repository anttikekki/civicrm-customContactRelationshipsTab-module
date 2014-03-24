cj(document).ajaxComplete(function( event, xhr, settings ) {
  if(settings.url.indexOf('civicrm/contact/view/rel') !== -1) {
    var util = new CustomContactRelationshipsTabUtil();
    util.relationshipTabIsLoaded();
  }
});

function CustomContactRelationshipsTabUtil() {

  this.start = function() {
    this.getRelationshipRows();
  };
  
  this.relationshipTabIsLoaded = function() {
    var that = this;
    setTimeout(function() {
      that.start()
    }, 1);
  };
  
  this.getRelationshipRows = function() {
    var relationshipRows = cj('.row-relationship');
    
    cj.each(relationshipRows, function( index, relationshipRow ) {
      var relationshipId = cj(relationshipRow).attr('id').substring('rel_'.length);
      console.log(relationshipId);
    });
  };
}