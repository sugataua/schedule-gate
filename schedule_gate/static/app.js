var search_result;

var input_from = document.getElementById("settlement-search-from");
var input_to = document.getElementById("settlement-search-to");
var search_form = document.getElementById('form-settlement-search');

var from_feedback_icon = document.getElementById('settlement-search-from-feedback-icon');
var to_feedback_icon = document.getElementById('settlement-search-to-feedback-icon');

from_feedback_icon.style.display = 'none';
to_feedback_icon.style.display = 'none';

function getXMLHttpRequest() {
	var xmlHttp;
	if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlHttp=new XMLHttpRequest();
	} else {  // code for IE6, IE5
		xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlHttp;
}


function addHighlightSearchResult(event){
	var result_container = this.parentElement;
	var selected_list = result_container.getElementsByClassName('search-result-selected');
	for (var i=0; i<selected_list.length; i++) {
		selected_list[i].classList.remove('search-result-selected');
	}
	this.classList.add('search-result-selected');

}


function removeHighlightSearchResult(event){
	this.classList.remove('search-result-selected');
}

function capitalizeFirstLetter(string) {
	string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function selectSettlement() {
	
	var livesearch_div = this.parentElement;
	var input = livesearch_div.parentElement.previousElementSibling; 
	//var settl_id = document.getElementById("settlement-id");
	
	
	settl = search_results[this._ind];	
	// console.log('Input:');
	// console.log(input);
	input.value = capitalizeFirstLetter(settl.name);
	input._sttl_obj = this._sttl_obj;
	//settl_id.value = settl.id;
	input.parentElement.classList.remove("has-error");
	input.parentElement.classList.add('has-success');
	
	
	livesearch_div.style.display = 'none';

	var feedback_icon = livesearch_div.parentElement.nextElementSibling;
	feedback_icon.style.display = 'block';

}


function selectSettlementonEnter(result_div) {

	var livesearch_div = result_div.parentElement;
	var input = livesearch_div.parentElement.previousElementSibling;
	//var settl_id = document.getElementById("settlement-id");


	settl = search_results[result_div._ind];
	// console.log('Input:');
	// console.log(input);
	input.value = capitalizeFirstLetter(settl.name);
	input._sttl_obj = result_div._sttl_obj;
	//settl_id.value = settl.id;
	input.parentElement.classList.remove("has-error");
	input.parentElement.classList.add('has-success');


	livesearch_div.style.display = 'none';

	var feedback_icon = livesearch_div.parentElement.nextElementSibling;
	feedback_icon.style.display = 'block';

}


function showSearchSuggestions() {
	/* Get list of settlements from server and display them into suggestion box */
	var input_text = this.value;
	this._sttl_obj = null;

	this.nextElementSibling.nextElementSibling.style.display = 'none';
	var livesearch_div_parent = this.parentNode;
	livesearch_div_parent.classList.remove('has-success');
	
	// console.log(livesearch_div_parent);
	
	var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
	// console.log(result_of_livesearch);	
	var livesearch_div = result_of_livesearch[0]; 
	
	if (input_text.length <= 1) { 
		livesearch_div.innerHTML="";
		livesearch_div.style.display = 'none';    
		return;
	}
  
	livesearch_div.innerHTML = '';
	livesearch_div.style.display = 'block';
	livesearch_div.classList.add('livesearch-has-result');
	
	var settl_div_f = document.createElement('div');
	settl_div_f.className = "search-result";
	
	var settl_name_f = document.createElement('span');
	settl_name_f.classList.add('glyphicon');
	settl_name_f.classList.add('glyphicon-refresh');
	settl_name_f.classList.add('gly-spin');
	
	settl_div_f.appendChild(settl_name_f);
	settl_div_f.innerHTML = settl_div_f.innerHTML + '<b>Завантаження...</b>';
	
	livesearch_div.appendChild(settl_div_f);
	/*
	livesearch_div.style.display = 'block';
	livesearch_div.style.border="1px";
	*/
	
	xmlhttp = getXMLHttpRequest();

	xmlhttp.onreadystatechange=function() {
    if (this.readyState==4 && this.status==200) {
	
	  livesearch_div.innerHTML = '';
	  //search_results = document.getElementById("livesearch")
	  search_results = JSON.parse(this.responseText);
	  // console.log(search_results[0]);
	  search_results.innerHTML = "";
	  for (var i=0; i<search_results.length; i++) {
		  var settl_div = document.createElement('div');
		  
		  settl_div.className = "search-result";

		  settl_div.onmouseover = addHighlightSearchResult;
		  settl_div.onmouseout = removeHighlightSearchResult;

		  if (i === 0) {
		  	settl_div.classList.add("search-result-selected");
		  }
		  var settl_name = document.createElement('span');
		  settl_name.innerHTML = capitalizeFirstLetter(search_results[i].name);
		  settl_name.classList.add("settlement-name");
		  
		  var settl_district = document.createElement('span');
		  settl_district.innerHTML = search_results[i].district + " район, ";
		  //settl_district.classList.add("settlement-name");
		  
		  var settl_region = document.createElement('span');
		  settl_region.innerHTML = search_results[i].region + " область";
		  //settl_region.classList.add("settlement-name");

		  var br = document.createElement("br");
		  
		  settl_div.appendChild(settl_name);	  
		  settl_div.appendChild(br);		  
		  settl_div.appendChild(settl_district);
		  settl_div.appendChild(settl_region);
		  

		  settl_div.onclick = selectSettlement;
		  settl_div._ind = i;
		  settl_div._sttl_obj = search_results[i];
		  
		  livesearch_div.appendChild(settl_div);
	  }
    }
	
	if (this.readyState==4 && this.status==404) {
		livesearch_div.innerHTML = '';
		 var settl_div_nr = document.createElement('div');
		  
		  settl_div_nr.className = "search-result";
		  var settl_name_nr = document.createElement('span');
		  settl_name_nr.innerHTML = "Не знайдено :(";
		  settl_name_nr.classList.add("settlement-name");
		  settl_div_nr.appendChild(settl_name_nr);
		  
		  livesearch_div.appendChild(settl_div_nr);
	}
	
  };
  
  
  
  //setTimeout(function() {
	  xmlhttp.open("GET","search/"+input_text,true);
	  xmlhttp.send();	  
	// }, 1000);
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
	//var settl_id = document.getElementById("settlement-id");

	if (errorCheck(input_from) || errorCheck(input_to)) {
		return;
	}

	 var url = 'http://bus.com.ua/cgi-bin/poshuk?fp=UA'+ input_from._sttl_obj.koatuu + '&tp=UA' + input_to._sttl_obj.koatuu +'&Go=3';
	 window.open(url,'_blank');
	 return;
	 
}


function handleKeyboardButtons(event) {
	// Escape button
	if (event.keyCode == 27) {
		var livesearch_div_parent = this.parentNode;

		var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
		// console.log(result_of_livesearch);
		var livesearch_div = result_of_livesearch[0];

		livesearch_div.style.display = 'none';
	}
	// Enter button
	if (event.keyCode === 13) {

		if (this._sttl_obj === null || this._sttl_obj === undefined) {
			event.preventDefault();
		}

		var livesearch_div_parent = this.parentNode;

		var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
		// console.log(result_of_livesearch);
		var livesearch_div = result_of_livesearch[0];
		var selected_result_array = livesearch_div.getElementsByClassName("search-result-selected");
		var selected_result = selected_result_array[0];

		if (selected_result != null) {
			selectSettlementonEnter(selected_result);
		}

	}
	// Tab button
	if (event.keyCode == 9) {
		var livesearch_div_parent = this.parentNode;

		var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");

		var livesearch_div = result_of_livesearch[0];

		//
		if (livesearch_div.style.display != 'none') {
			//event.preventDefault();

			var selected_result_array = livesearch_div.getElementsByClassName("search-result-selected");
			var selected_result = selected_result_array[0];

			if (selected_result != null) {
				selectSettlementonEnter(selected_result);
			} else {
				livesearch_div.style.display = 'none';
			}
		}


    }
    // Up and Down arrows
	if (event.keyCode == 38 || event.keyCode == 40) {
		event.preventDefault();

		var livesearch_div_parent = this.parentNode;

		var result_of_livesearch = livesearch_div_parent.getElementsByClassName("livesearch");
		// console.log(result_of_livesearch);
		var livesearch_div = result_of_livesearch[0];
		var search_results_array = livesearch_div.getElementsByClassName("search-result");
		//console.log(search_results_array.length);

		if (search_results_array.length > 1) {
			var selected_result_array = livesearch_div.getElementsByClassName("search-result-selected");
			var selected_result = selected_result_array[0];
			//console.log(selected_result);
			if (event.keyCode == 38) {
				var prev_result;

				if (selected_result == null) {
					prev_result = livesearch_div.lastElementChild;
				} else {
					selected_result.classList.remove('search-result-selected');
					prev_result = selected_result.previousElementSibling;
				}

				if (prev_result != null) {

					prev_result.classList.add('search-result-selected');
				}
			}
			if (event.keyCode == 40) {
				var next_result;

				if (selected_result == null) {
					next_result = livesearch_div.firstElementChild;
				} else {
					next_result = selected_result.nextElementSibling;
					selected_result.classList.remove('search-result-selected');
				}

				if (next_result != null) {

					next_result.classList.add('search-result-selected');
				}
			}

		}

	}
}

// Hide search result list when click is made outside livesearch div
function hideLiveSearch(event){
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

document.onclick = hideLiveSearch;

input_from.oninput = showSearchSuggestions;
input_to.oninput = showSearchSuggestions;

input_from.onkeydown = handleKeyboardButtons;
input_to.onkeydown = handleKeyboardButtons;

search_form.onsubmit = openSearchPage;







