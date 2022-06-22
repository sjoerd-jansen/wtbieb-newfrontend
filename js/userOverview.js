function OnPageOpen()
{
	//, this, 'grey'
	let pageToOpen = localStorage.getItem("CurrentPage");

	if (pageToOpen != null)
	{
		openPage(pageToOpen, this, 'grey');
	}
}

function resetTablinksClass(standardClassName, secondaryClassName)
{
    var tablinks = document.getElementsByClassName(standardClassName);
   	for (i = 0; i < tablinks.length; i++)
		tablinks[i].className = standardClassName + " " + secondaryClassName;
}

// Recolor the tabs once a tab button has been pushed 
function openPage(pageName, element, color)
{
    var backgroundColor = "#D3D3D3";
	var standardClassName = "header-button";
	var primaryClassName = "tablink-primary";

    document.getElementById("MijnOverzicht").style.display = "none";
    document.getElementById("Boekenlijst").style.display = "none";
    document.getElementById("Profiel").style.display = "none";
    
	// Reset the tab buttons color to the background color
    resetTablinksClass(standardClassName, "tablink");

	// Visualise the content of the clicked tab and set the classname (and thus color) of the current tab-button 
    document.getElementById(pageName).style.display = "block";
	element.className = standardClassName + " " + primaryClassName
}

// Set the onclick function of the button with its corresponding div for tab coloring
function setButtonOnclick(buttonId, divId, color)
{
    var button = document.getElementById(buttonId)
    if (button)
        button.onclick = function() { openPage(divId, this, color) };
}

function initialisePage()
{    
    setButtonOnclick("book-list-button", "book-list-div", "#777");
    setButtonOnclick("colleague-list-button", "colleague-list-div", "#777");
    setButtonOnclick("overview-button", "overview-div", "#777");

    var bookListButton = document.getElementById('book-list-button');
    if (bookListButton)
        bookListButton.click();
}

initialisePage();

OnPageOpen();

/*
		THIS PART OF THE SCRIPT IS TO FETCH ALL
		BOOKS CURRENTLY LOANED BY THE USER AND
		ADD PAGINATION IF NEEDED
*/

// Find loaned books and fill table
function FetchUserLoans()
{
	console.log(localStorage.getItem("userName"));

	let employeeId = localStorage.getItem("id");
	if (employeeId != null)
	{
		fetch(backendurl + "/employee/" + employeeId + "/findbooks").then(response => {
			return response.json();
		}).then( loans => {
			
			window.localStorage.setItem("userLoanData", JSON.stringify(loans));
			FillTableLoans(0, "All");
		})
	}
	else
	{
		console.error("No employeeId has been defined, user is not logged in properly");
		alert("Oh no, we messed up! We misplaced your ID, please contact support");
	}
}

// Fill table with loaned books
function FillTableLoans(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userLoanData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userLoanSearchData);
	
    let bookTableHtml =
        `<colgroup>
			<col style="width:50%;">
			<col style="width:30%;">
			<col style="width:20%;">
		</colgroup>
		<thead>
			<tr>
				<th>Titel</th>
				<th>Auteur</th>
				<th>Geleend sinds</th>
			</tr>
		</thead>
		<tbody>`;
		
		let bookCount = 0;
		let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let book of data)
	{
		if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable)
		{
       		bookTableHtml += `<tr>
           	    <td>${book.bookTitle}</td>
                <td>${book.bookAuthor}</td>
                <td>${book.dateLent}</td>
            </tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("userLoans").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-userloans").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationLoans(tablePage, booksInTable, input);
}

function createTablePaginationLoans(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userLoanData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userLoanSearchData);
	
    let pagesNeeded = parseInt(data.length / itemsInTable);
    if (data.length % itemsInTable != 0)
        pagesNeeded += 1;

    // Calculate the mininum label number of the table. parseInt casts
    // the division to an int: 4.0 until 4.9 = 4 for example.
    let amountOfLabels = 5;
    let minLabelNum = Math.max(0, parseInt(tablePage / amountOfLabels) * amountOfLabels); 
    let prevButton = tablePage - 1;
    let labelThresh = 5 + tablePage;
       
    // Cap the previous button to page 0 (indexing starts at 0).
    if (prevButton < 0)
        prevButton = 0;
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableLoans(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableLoans(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableLoans(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-userloans").innerHTML = paginationHTML;
}

FetchUserLoans();

/*
		THIS PART OF THE SCRIPT IS TO FETCH ALL
		BOOKS CURRENTLY RESERVED BY THE USER AND
		ADD PAGINATION IF NEEDED
*/

// Find loaned books and fill table
function FetchUserReserve()
{
	let employeeId = localStorage.getItem("id");
	if (employeeId != null)
	{
		fetch(backendurl + "/book/" + employeeId + "/myreservations").then(response => {
			return response.json();
		}).then( reservations => {
			
			window.localStorage.setItem("userReserveData", JSON.stringify(reservations));
			FillTableReserve(0, "All");
		})
	}
	else
	{
		console.error("No employeeId has been defined, user is not logged in properly");
		alert("Oh no, we messed up! We misplaced your ID, please contact support");
	}
}

// Fill table with loaned books
function FillTableReserve(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userReserveData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userReserveSearchData);
	
    let bookTableHtml =
        `<colgroup>
			<col style="width:50%;">
			<col style="width:30%;">
			<col style="width:20%;">
		</colgroup>
		<thead>
			<tr>
				<th>Titel</th>
				<th>Auteur</th>
				<th></th>
			</tr>
		</thead>
		<tbody>`;
		
		let bookCount = 0;
		let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let book of data)
	{
		if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable)
		{
       		bookTableHtml += `<tr>
           	    <td>${book.bookTitle}</td>
                <td>${book.bookAuthor}</td>
                <td><button type="button" onclick='CancelReservation(${JSON.stringify(book)})'>Annuleer</button></td>
            </tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("userReserved").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-userreserve").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationReserve(tablePage, booksInTable, input);
}

function createTablePaginationReserve(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userReserveData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userReserveSearchData);
	
    let pagesNeeded = parseInt(data.length / itemsInTable);
    if (data.length % itemsInTable != 0)
        pagesNeeded += 1;

    // Calculate the mininum label number of the table. parseInt casts
    // the division to an int: 4.0 until 4.9 = 4 for example.
    let amountOfLabels = 5;
    let minLabelNum = Math.max(0, parseInt(tablePage / amountOfLabels) * amountOfLabels); 
    let prevButton = tablePage - 1;
    let labelThresh = 5 + tablePage;
       
    // Cap the previous button to page 0 (indexing starts at 0).
    if (prevButton < 0)
        prevButton = 0;
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableReserve(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableReserve(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableReserve(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-userreserve").innerHTML = paginationHTML;
}

FetchUserReserve();

/*
		THIS PART OF THE SCRIPT IS TO FETCH ALL
		BOOKS EVER LOANED BY THE USER AND
		ADD PAGINATION IF NEEDED
*/

// Find loaned books and fill table
function FetchUserHistory()
{
	let employeeId = localStorage.getItem("id");
	if (employeeId != null)
	{
		fetch(backendurl + "/employee/" + employeeId + "/history").then(response => {
			return response.json();
		}).then( history => {
			
			window.localStorage.setItem("userHistoryData", JSON.stringify(history));
			FillTableHistory(0, "All");
		})
	}
	else
	{
		console.error("No employeeId has been defined, user is not logged in properly");
		alert("Oh no, we messed up! We misplaced your ID, please contact support");
	}
}

// Fill table with loaned books
function FillTableHistory(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userHistoryData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userHistorySearchData);
	
    let bookTableHtml =
        `<colgroup>
			<col style="width:40%;">
			<col style="width:30%;">
			<col style="width:15%;">
			<col style="width:15%;">
		</colgroup>
		<thead>
			<tr>
				<th>Titel</th>
				<th>Auteur</th>
				<th>Geleend sinds</th>
				<th>Teruggebracht op</th>
			</tr>
		</thead>
		<tbody>`;
		
		let bookCount = 0;
		let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let book of data)
	{
		if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable)
		{
       		bookTableHtml += `<tr>
           	    <td>${book.bookTitle}</td>
                <td>${book.bookAuthor}</td>
                <td>${book.dateLent}</td>`;
				if (book.dateReturned != null)
                	bookTableHtml += `<td>${book.dateReturned}</td>`;
				else
					bookTableHtml += `<td>In bezit</td>`;
			bookTableHtml += `</tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("userHistory").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-userhistory").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationHistory(tablePage, booksInTable, input);
}

function createTablePaginationHistory(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userHistoryData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userHistorySearchData);
	
    let pagesNeeded = parseInt(data.length / itemsInTable);
    if (data.length % itemsInTable != 0)
        pagesNeeded += 1;

    // Calculate the mininum label number of the table. parseInt casts
    // the division to an int: 4.0 until 4.9 = 4 for example.
    let amountOfLabels = 5;
    let minLabelNum = Math.max(0, parseInt(tablePage / amountOfLabels) * amountOfLabels); 
    let prevButton = tablePage - 1;
    let labelThresh = 5 + tablePage;
       
    // Cap the previous button to page 0 (indexing starts at 0).
    if (prevButton < 0)
        prevButton = 0;
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableHistory(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableHistory(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableHistory(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-userhistory").innerHTML = paginationHTML;
}

FetchUserHistory();

/*

	THIS PART OF THE SCRIPT IS TO CANCEL A
	RESERVATION MADE BY AN EMPLOYEE AND
	REMOVE IT FROM THE DATABASE

*/

async function CancelReservation(reservation)
{
	let response = await fetch(backendurl + "/book/reservation/" + reservation.reservationId + "/cancel", {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.catch(error => {
		alert('Oeps, er ging iets fout!');
	});

	let str = await response.json();
	alert(str.response);
	FetchReservedBooks();
}

/*

	THIS PART OF THE SCRIPT IS TO SEARCH A BOOK
	FROM ANY OF THE LISTS, IT CHECKS WHICH LIST
	AND THEN SEARCHES ON TITLE, AUTHOR AND TAGS

*/

function UserSearchOverview(tableSearch)
{
	let input = document.getElementById(tableSearch).value.toLowerCase();
	let data;
	let dataStorage;

	if (tableSearch === "userSearchLoan")
	{
    	data = JSON.parse(window.localStorage.userLoanData);
		dataStorage = "userLoanSearchData"
	}
	else if (tableSearch === "userSearchReserve")
	{
		data = JSON.parse(window.localStorage.userReserveData);
		dataStorage = "userReserveSearchData"
	}
	else if (tableSearch === "userSearchHistory")
	{
		data = JSON.parse(window.localStorage.userHistoryData);
		dataStorage = "userHistorySearchData"
	}

	if (input != "")
	{
		let foundData=[];

		for (let book of data)
		{
			if (CompareOverviewSearchData(book, input))
			{
				foundData.push(book);
			}
		}
	
        window.localStorage.setItem(dataStorage, JSON.stringify(foundData));

		if (tableSearch === "userSearchLoan")
			FillTableLoans(0, "Search");
		else if (tableSearch === "userSearchReserve")
			FillTableReserve(0, "Search");
		else if (tableSearch === "userSearchHistory")
			FillTableHistory(0, "Search");
	}
	else
	{
		if (tableSearch === "userSearchLoan")
			FillTableLoans(0, "All");
		else if (tableSearch === "userSearchReserve")
			FillTableReserve(0, "All");
		else if (tableSearch === "userSearchHistory")
			FillTableHistory(0, "All");
	}	
}

function CompareOverviewSearchData(book, input)
{
	return (book.bookTitle.toLowerCase().includes(input) || book.bookAuthor.toLowerCase().includes(input) || book.bookIsbn.includes(input))
}

/*

	THIS PART OF THE SCRIPT IS TO LOG OFF
	FROM THE CURRENT SESSION AND DELETE
	ALL LOCAL STORAGE

*/

function LogOff()
{
	localStorage.clear();
	window.location.href = '../html/loginPage.html';
}
