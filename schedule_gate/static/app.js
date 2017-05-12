var ESCAPE_CODE = 27;
var ENTER_CODE = 13;
var TAB_CODE = 9;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;

var LOADER_MESSAGE = "Завантаження...";

var search_result;

/*
	Getting required DOM objects
 */
var input_from = document.getElementById("settlement-search-from");
var input_to = document.getElementById("settlement-search-to");
var search_form = document.getElementById('form-settlement-search');

var from_feedback_icon = document.getElementById('settlement-search-from-feedback-icon');
var to_feedback_icon = document.getElementById('settlement-search-to-feedback-icon');

/*
	Setting default state for input field icons
 */
from_feedback_icon.style.display = 'none';
to_feedback_icon.style.display = 'none';

// Get correct XHR
function getXMLHttpRequest() {
	var xmlHttp;
	if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlHttp = new XMLHttpRequest();
	} else {  // code for IE6, IE5
		xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	return xmlHttp;
}

// To display settlement names correctly
function capitalizeFirstLetter(string) {
	string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add highlight on mouse hover
function addHighlightSearchResult(event){
	var result_container = this.parentElement;
	var selected_list = result_container.getElementsByClassName('search-result-selected');

	for (var i=0; i<selected_list.length; i++) {
		selected_list[i].classList.remove('search-result-selected');
	}

	this.classList.add('search-result-selected');
}

// Remove highlight when mouse out
function removeHighlightSearchResult(event){
	this.classList.remove('search-result-selected');
}

// Select settlement by click
function selectSettlement() {
	
	var settlement;
	var suggestions_box = this.parentElement;
	var input = suggestions_box.parentElement.previousElementSibling;
	var feedback_icon = suggestions_box.parentElement.nextElementSibling;

	settlement = search_results[this._ind];

	input.value = capitalizeFirstLetter(settlement.name);
	input._sttl_obj = this._sttl_obj;

	// Display successful selection on UI
	input.parentElement.classList.remove("has-error");
	input.parentElement.classList.add('has-success');
	suggestions_box.style.display = 'none';
	feedback_icon.style.display = 'block';
}

// Select settlement by TAB and ENTER
function selectSettlementBySuggestion(result_div) {

	var settlement;
	var suggestion_box = result_div.parentElement;
	var input = suggestion_box.parentElement.previousElementSibling;
	var feedback_icon = suggestion_box.parentElement.nextElementSibling;

	settlement = search_results[result_div._ind];

	input.value = capitalizeFirstLetter(settlement.name);
	input._sttl_obj = result_div._sttl_obj;

	// Display successful selection on UI
	input.parentElement.classList.remove("has-error");
	input.parentElement.classList.add('has-success');
	suggestion_box.style.display = 'none';
	feedback_icon.style.display = 'block';

}

// Get list of settlements from server and display them into suggestion box
function showSearchSuggestions() {

	var xmlHttp;

	// Getting current input
	var input_text = this.value;

	// Clear previous selection
	this._sttl_obj = null;

	// Hide success icon
	this.nextElementSibling.nextElementSibling.style.display = 'none';

	// Getting form-group div
	var livesearch_div_parent = this.parentNode;
	livesearch_div_parent.classList.remove('has-success');

	// Getting suggestion box div
	var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
	var suggestion_box = result_of_livesearch[0];
	
	// Do not show suggestions if typed text is less than 1 symbol
	if (input_text.length <= 1) {
		suggestion_box.innerHTML="";
		suggestion_box.style.display = 'none';
		return;
	}
  
	// Clear suggestion box
	suggestion_box.innerHTML = '';
	suggestion_box.style.display = 'block';
	suggestion_box.classList.add('livesearch-has-result');
	
	// Create div for loader
	var suggestion_loader = document.createElement('div');
	suggestion_loader.className = "search-result";
	
	// Set loader icon
	var suggestion_loader_icon = document.createElement('span');
	suggestion_loader_icon.classList.add('glyphicon');
	suggestion_loader_icon.classList.add('glyphicon-refresh');
	suggestion_loader_icon.classList.add('gly-spin');
	suggestion_loader.appendChild(suggestion_loader_icon);

	// Add loader
	suggestion_loader.innerHTML = suggestion_loader.innerHTML + '<b>' + LOADER_MESSAGE + '</b>';
	suggestion_box.appendChild(suggestion_loader);

	xmlHttp = getXMLHttpRequest();

	xmlHttp.onreadystatechange=function() {
		// Results found
		if (this.readyState === 4 && this.status === 200) {

		  suggestion_box.innerHTML = '';

		  search_results = JSON.parse(this.responseText);

		  // Adding search results as suggestions to suggestion box
		  for (var i=0; i<search_results.length; i++) {

			  var settlement_div = document.createElement('div');
			  settlement_div.className = "search-result";

			  settlement_div.onmouseover = addHighlightSearchResult;
			  settlement_div.onmouseout = removeHighlightSearchResult;

			  // Select first result by default
			  if (i === 0) {
				settlement_div.classList.add("search-result-selected");
			  }

			  var settlement_name = document.createElement('span');
			  settlement_name.innerHTML = capitalizeFirstLetter(search_results[i].name);
			  settlement_name.classList.add("settlement-name");

			  var settl_district = document.createElement('span');
			  settl_district.innerHTML = search_results[i].district + " район, ";

			  var settl_region = document.createElement('span');
			  settl_region.innerHTML = search_results[i].region + " область";


			  var br = document.createElement("br");

			  settlement_div.appendChild(settlement_name);
			  settlement_div.appendChild(br);
			  settlement_div.appendChild(settl_district);
			  settlement_div.appendChild(settl_region);

			  settlement_div.onclick = selectSettlement;
			  settlement_div._ind = i;
			  settlement_div._sttl_obj = search_results[i];

			  suggestion_box.appendChild(settlement_div);
		  }
		}

		if (this.readyState === 4 && this.status === 404) {

			// Clear suggestion box
			suggestion_box.innerHTML = '';

			// Create new div for message
			var settlement_div_no_result = document.createElement('div');
			settlement_div_no_result.className = "search-result";

			// Create "No result" message
			var settl_name_nr = document.createElement('span');
			settl_name_nr.innerHTML = "Не знайдено!";
			settl_name_nr.classList.add("settlement-name");
			settlement_div_no_result.appendChild(settl_name_nr);

			// Add message to suggestion box
			suggestion_box.appendChild(settlement_div_no_result);
		}
	
  };

	xmlHttp.open("GET", "search/" + input_text, true);
	xmlHttp.send();

}


function errorCheck(input) {
	if (input._sttl_obj === null || input._sttl_obj === undefined)  {
		input.parentElement.classList.add("has-error");
		return true;
	}
	return false;
}

function openSearchPage(event) {
	event.preventDefault();

	var inputFromError = errorCheck(input_from);
	var inputToError = errorCheck(input_to);

	// Break if errors found
	if (inputFromError || inputToError) {
		return;
	}

	var url = 'http://bus.com.ua/cgi-bin/poshuk?fp=UA'+ input_from._sttl_obj.koatuu + '&tp=UA' + input_to._sttl_obj.koatuu +'&Go=3';
	window.open(url,'_blank');
}

function handleKeyboardButtons(event) {
	// Find related suggestion box
	var livesearch_div_parent = this.parentNode;
	var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
	var livesearch_div = result_of_livesearch[0];

	// Find selected suggestion (where focus is)
	var selected_result_array = livesearch_div.getElementsByClassName("search-result-selected");
	var selected_result = selected_result_array[0];

	// Hide suggestion box on ESCAPE
	if (event.keyCode === ESCAPE_CODE) {
		livesearch_div.style.display = 'none';
	}

	// Select suggestion on ENTER
	if (event.keyCode === ENTER_CODE) {

		// Prevent default action only when suggestion box is shown
		if (this._sttl_obj === null || this._sttl_obj === undefined) {
			event.preventDefault();
		}

		if (selected_result !== null && selected_result !== undefined) {
			selectSettlementBySuggestion(selected_result);
		}

	}
	// Select suggestion on TAB
	if (event.keyCode === TAB_CODE) {

		if (livesearch_div.style.display !== 'none') {
			// Choose settlement if selected or hide suggestion box if not
			if (selected_result !== null && selected_result !== undefined) {
				selectSettlementBySuggestion(selected_result);
			} else {
				livesearch_div.style.display = 'none';
			}
		}
    }
    // Change selected suggestion on UP and DOWN ARROWS
	if (event.keyCode === UP_ARROW_CODE || event.keyCode === DOWN_ARROW_CODE) {
		event.preventDefault();

		var search_results_array = livesearch_div.getElementsByClassName("search-result");

		// More than 1 suggestion can be selected
		if (search_results_array.length > 1) {

			if (event.keyCode === UP_ARROW_CODE) {
				var prev_result;

				// Check is there selected option presented
				if (selected_result === null || selected_result === undefined) {
					prev_result = livesearch_div.lastElementChild;
				} else {
					selected_result.classList.remove('search-result-selected');
					prev_result = selected_result.previousElementSibling;
				}

				if (prev_result !== null && prev_result !== undefined) {
					prev_result.classList.add('search-result-selected');
				}
			}
			if (event.keyCode === DOWN_ARROW_CODE) {
				var next_result;

				// Check is there selected option presented
				if (selected_result === null || selected_result === undefined) {
					next_result = livesearch_div.firstElementChild;
				} else {
					next_result = selected_result.nextElementSibling;
					selected_result.classList.remove('search-result-selected');
				}

				if (next_result !== null && next_result !== undefined) {

					next_result.classList.add('search-result-selected');
				}
			}

		}

	}
}

// Hide search result list when click is made outside livesearch div
function hideSuggestionBox(event){

	var lives_to = document.getElementById('livesearch-to');
	var lives_from = document.getElementById('livesearch-from');

	if (event.target != lives_to) {
		lives_to.style.display = 'none';
	}
	if (event.target != lives_from) {
		lives_from.style.display = 'none';
	}
}

/*
  Setting event handlers
*/
document.onclick = hideSuggestionBox;

input_from.oninput = showSearchSuggestions;
input_to.oninput = showSearchSuggestions;

input_from.onkeydown = handleKeyboardButtons;
input_to.onkeydown = handleKeyboardButtons;

search_form.onsubmit = openSearchPage;







