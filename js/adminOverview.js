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

    document.getElementById("Overzicht").style.display = "none";
    document.getElementById("Boekenlijst").style.display = "none";
    document.getElementById("Medewerkers").style.display = "none";
    
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

/*
		THIS PART OF THE SCRIPT IS FOR BOOKS THAT ARE CURRENTLY RESERVED
		IT CONTAINS THE FETCH FROM DATABASE, FILLING THE TABLE AND
		THE PAGINATION FUNCTIONS
*/

// Find reserved books and fill table
function FetchReservedBooks()
{
    fetch(backendurl + "/book/reservations/findall").then(response => {
        return response.json();
    }).then( reservations => {
		
        window.localStorage.setItem("reservationData", JSON.stringify(reservations));
        FillTableReserved(0, "All");
    })
}

// Fill table with reserved books
function FillTableReserved(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.reservationData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.reservationSearchData);
	
    let bookTableHtml =
        `
		<thead>
			<tr>
                <th>Titel</th>
                <th>Gereserveerd door</th>
				<th>Exemplaren beschikbaar</th>
                <th></th>
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
        	let reservation = JSON.stringify(book)
       		bookTableHtml += `<tr>
           	    <td>${book.bookTitle}</td>
                <td>${book.employeeName}</td>
                <td>${book.copiesAvailable}</td>
				<td><button type="button" onclick='FetchAvailableCopies(${reservation})'>Leen uit</button></td>
				<td><button type="button" onclick='CancelReservation(${reservation})'>Annuleren</button></td>
            </tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("adminOverviewReserved").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-reserved").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationReserved(tablePage, booksInTable, input);
}

function createTablePaginationReserved(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.reservationData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.reservationSearchData);
	
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
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableReserved(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableReserved(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableReserved(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-reserved").innerHTML = paginationHTML;
}

FetchReservedBooks();


/*
		THIS PART OF THE SCRIPT IS FOR BOOKS THAT ARE CURRENTLY ON LOAN
		IT CONTAINS THE FETCH FROM DATABASE, FILLING THE TABLE AND
		THE PAGINATION FUNCTIONS
*/

// Find loaned books and fill table
function FetchLoanedBooks()
{
    fetch(backendurl + "/book/findloaned").then(response => {
        return response.json();
    }).then( loaned => {
		// Sort books to show longest loaned book first
		loaned.sort((a, b) => parseFloat(a.dateLent) - parseFloat(b.dateLent) );
		// Save list to local storage
        window.localStorage.setItem("loanedData", JSON.stringify(loaned));
		// Fill table
        FillTableLoaned(0, "All");
    })
}

// Fill table with loaned books
function FillTableLoaned(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.loanedData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.loanedSearchData);
	
    let bookTableHtml =
        `
		<thead>
			<tr>
				<th>Exemplaar ID</th>
                <th>Titel</th>
                <th>Geleend door</th>
                <th>Geleend op</th>
                <th>Innemen</th>
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
				<td>${book.copyId}</td>
                <td>${book.bookTitle}</td>
                <td>${book.employeeName}</td>
                <td>${book.dateLent}</td>
				<td><button type="button" onclick="ReturnCopy(${book.copyId})">Neem in</button></td>
            </tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("adminOverviewLoaned").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-loaned").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationLoaned(tablePage, booksInTable, input);
}

function createTablePaginationLoaned(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.loanedData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.loanedSearchData);
    
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
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableLoaned(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableLoaned(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableLoaned(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-loaned").innerHTML = paginationHTML;
}

FetchLoanedBooks();

	/*

		THIS PART OF THE SCRIPT IS TO SELECT A BOOK COPY
		TO LOAN TO AN EMPLOYEE, WHEN A BOOK HAS BEEN
		RESERVED BY SAID EMPLOYEE

	*/

async function FetchAvailableCopies(reservation)
{
	await fetch(backendurl + "/book/" + reservation.bookId + "/findavailable").then(response => {
        return response.json();
    }).then( copies => {
        FillTableAvailableCopies(copies, reservation.reservationId);
    })

	document.getElementById("select-book-copy-loan").style.display = "flex";
}

// Fill table with all available copies
function FillTableAvailableCopies(copies, reservationId)
{
	let bookTableHtml =
	`<tr>
		<th>ID</th>
	</tr>`;

	// Loop to access all rows 
	for (let copy of copies) {
		bookTableHtml += `<tr>
			<td>${copy.copyId}</td>
			<td><button type="button" onclick="LoanReservedBook(${copy.copyId}, ${reservationId})">Selecteer</button></td>
		</tr>`;
	}

	// Setting innerHTML as tab variable
	document.getElementById("availableCopies").innerHTML = bookTableHtml;
}

async function LoanReservedBook(copyId, reservationId)
{
	let response = await fetch(backendurl + "/book/loan/reserved/" + reservationId + "/" + copyId, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.catch(error => {
		alert('Er is iets fouts gegaan');
	});

	CloseSelectCopyPopup();
	let str = await response.json();
	alert(str.response);
	FetchReservedBooks();
	FetchLoanedBooks();
}

// Close popup
function CloseSelectCopyPopup()
{
	document.getElementById("select-book-copy-loan").style.display = "none";
}

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

	THIS PART OF THE SCRIPT IS TO RETURN
	A LOANED COPY AND REMOVE IT FROM THE
	DATABASE OF LOANED BOOKS

*/

async function ReturnCopy(copyId)
{
	let response = await fetch(backendurl + "/book/return/" + copyId, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.catch(error => {
		alert('Er is iets fouts gegaan');
	});
	
	let str = await response.json();
	alert(str.response);
	FetchLoanedBooks();
}

/*

	THIS PART OF THE SCRIPT IS TO SEARCH A LOANED
	OR RESERVED BOOK, DEPENDING ON WHICH SEARCH BAR
	IS BEING USED

*/

function SearchOverview(searchTable)
{
	let	input = document.getElementById(searchTable).value.toLowerCase();
	let data;
	let dataStorage;

	if (searchTable === "loanedBooks")
	{
		data = JSON.parse(window.localStorage.loanedData);
		dataStorage = "loanedSearchData";
	}
	else if (searchTable === "reservedBooks")
	{
		data = JSON.parse(window.localStorage.reservationData);
		dataStorage = "reservationSearchData";
	}

	if (input != "")
	{
		let foundData=[];
		for (let book of data)
		{
			if (CompareOverviewSearchData(book, input, searchTable))
			{
				foundData.push(book);
			}
		}
	
		window.localStorage.setItem(dataStorage, JSON.stringify(foundData));

		if (searchTable === "loanedBooks")
			FillTableLoaned(0, "Search");
		else if (searchTable === "reservedBooks")
			FillTableReserved(0, "Search");
	}
	else
	{
		if (searchTable === "loanedBooks")
			FillTableLoaned(0, "All");
		else if (searchTable === "reservedBooks")
			FillTableReserved(0, "All");
	}	
}

function CompareOverviewSearchData(book, input, table)
{
	if (table === "loanedBooks")
		return (book.bookTitle.toLowerCase().includes(input) || book.employeeName.toLowerCase().includes(input) || book.copyId.toLowerCase().includes(input));
	else if (table === "reservedBooks")
		return (book.bookTitle.toLowerCase().includes(input) || book.employeeName.toLowerCase().includes(input));
	
	return false;
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

function OpenCurrentTab() {
    let tab = localStorage.getItem("currentTab");
	var standardClassName = "header-button";
    if (tab == 0) {
        document.getElementById("OverzichtTabButton").click();
        
    }
    else if (tab == 1) {
         document.getElementById("BoekenlijstTabButton").click();
    }
    else {
         document.getElementById("MedewerkersTabButton").click();
    }
}

OpenCurrentTab();
