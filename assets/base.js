jQuery(document).ready(function($) {

  // Gets today's date
  function curr_date(){
    var d = new Date();
    var month = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + (d.getDate())).slice(-2);
    var output = d.getFullYear() + '-' + month + '-' + day;
    return output;
  }

  // Gets today's time
  function curr_time(){
    var d = new Date();
    var hours = ("0" + (d.getHours())).slice(-2);
    var minutes = ("0" + (d.getMinutes())).slice(-2);
    var seconds = ("0" + (d.getSeconds())).slice(-2);
    var output = hours + ":" + minutes + ":" + seconds;
    return output;
  }

  // Combines date + time into a string that's ready for the front matter
  function matter_datetime(){
    var dt = curr_date() + ' ' + curr_time() + ' -0400';
    return dt;
  }


  // Gets the data from the FORM and pushes it to print_matter()
  function get_matter_data(){
    var data = {};
    $('#open-form').serializeArray().map(function(x){
      data[x.name] = x.value;
    });
    setTimeout(function() {
      print_matter(data);
    }, 400);
  }

  // inputs the current date in the date field
  $('input[name="m_datetime"]').val(matter_datetime() );

  // This watches for any keyup events (typing) in the form fields
  $( "#open-form .fm" ).keyup(function( event ) {
    get_matter_data();
  });


  // Step 1. Add into this string the characters to look for
  var entityPattern = /[&<>"'`)(=+:*@.?$%\/]/g;
  // Step 2. Add a new line that contains the HTML character and the entity that you want it transformed into
  // Reference: https://dev.w3.org/html5/html-author/charref
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '*': '&#42;',
    '$': '&#36;',
    '%': '&#37;',
    ':': '&#58;',
    '.': '&#46;',
    '(': '&#40;',
    ')': '&#41;',
    '+': '&#43;',
    '@': '&#64;',
    '-': '&#8208;',
    '–': '&#8211;',
    '—': '&#8212;',
    '?': '&#63;'
  };

  // The small words we are removing from the filenames and URLs
  var small_words = /\band |\bthe |\bare |\bis |\bof |\bto /gi; // these are the small words we are removing from urls

  // A function that replaces out the special characters in strings
  function escapeHtml (string) {
    return String(string).replace(entityPattern, function (s) {
      return entityMap[s];
    });
  }

  // Makes the filename
  function get_filename(t) {
    var filename = curr_date() + '-' + t.replace(/:/gi, "") +'.md';
    return filename;
  }

  // Makes the slug: for the front matter
  function matter_slug(title) {
    t = title.replace(new RegExp(small_words, "gi"), '');               // removes the small_words
    t = t.replace(/[^a-zA-Z0-9\s]/g,"");                                // removes anything that is not a number or letter (i think)
    t = t.toLowerCase();                                                // makes the title all lowercase
    t = t.replace(/\s\s+/g, ' ');                                       // replaces multiple spaces with single spaces
    t = t.replace(/[ \t]+$/g, '');                                      // removes trailing spaces from title
    var slug = t.replace(/\s/g,'-');                                    // converts single spaces into dashes
    return slug;
  }

  // Makes the title for the front matter
  function matter_title(t, m) {
    t = t.replace(/\s\s+/g, ' ');           // replaces multiple spaces with single spaces
    t = t.replace(/[ \t]+$/g, '');          // removes trailing spaces from title
    var title = escapeHtml(t) +'-'+ m;
    return title;
  }

  $('.m_title input').val('hi');


  // Makes commit message
  function matter_commit_msg(post_type, msg) {
    var m = 'Sayin\' ' + msg;
    return m;
  }

  // Makes commit description
  function matter_commit_desc(post_type, title, summary, slug, filename) {
    var desc = [
      '**' + title + '** %0A',
      summary + '%0A',
      "---%0A",
      'slug: `' + slug + '`%0A',
      'filename: `' + filename + '`%0A',
      "---"
    ].join("\n");
    return desc;
  }

  // Makes branch name
  function matter_branch_name(filename) {
    var branch_name = 'new-' + filename;
    return branch_name;
  }

  // returns the year and month for use in the filepath on GitHub
  // Returns: 2017/09
  function file_yearmo(date) {
    var dateObj = new Date(date);
    var year = dateObj.getUTCFullYear();
    var month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2); //months from 1-12
    var yearmo = year + "/" + month;
    return yearmo;
  }

  // Makes lists in the front matter
  function list_items(d) {
    var list = d.split(',');
    $item = '';
    $item += '\n';
    var total = list.length;
    $.each( list, function( key, value ) {
      slug = value.replace(entityPattern, ' ').trim();
      slug = slug.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      if (key === total - 1) {
        $item += '  - ' + $.trim(slug);
      } else{
        $item += '  - ' + $.trim(slug) + '\n';
      }
    });
    return $item;
  }



  // Prints the front-matter in a DIV on the page
  function print_matter(data){
    var post_type = 'post';
    var datetime = matter_datetime();
    var title = "'" + data['m_title'] + "'";
    var slug = matter_slug(data['m_title']);
    var filename = get_filename(curr_time());
    var msg = data['m_msg'];
    var commit_msg = matter_commit_msg(post_type, data['m_msg']);
    // var commit_desc = matter_commit_desc(post_type, matter_title(data['m_title']), 'summmary goes here', slug, filename);
    var branch = matter_branch_name(filename);

    // Checks to see what the post type is and prints the front-matter for each type
    // ========================================
    // POST
    var matter = [
      "---",
        "date: " + datetime,
        "title: " + title,
        "author: " + list_items(data['m_author']),
      "---",
      ,
      msg
    ].join("\n");
    var body = encodeURIComponent(matter);
    var submit_url = 'https://github.com/GSA/hi/new/master/_posts/draft?filename='+filename+'&value='+body+'&message='+commit_msg+'&target_branch='+branch;

    $('#post-matter').text(matter);
    $('#filename').text(filename);
    $('#open-form').attr('action', submit_url);
    $('.btn').attr('href', submit_url);
    // inputs the current date in the date field
    $('input[name="m_datetime"]').val(matter_datetime() );
  }

});
