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

/*
		THIS PART OF THE SCRIPT IS TO FETCH ALL
		BOOKS FROM THE DATABASE AND PUT THEM
		INTO THE CORRECT TABLE WITH PAGINATION
*/

// Find all books and fill table
function FetchUserBooks()
{
    fetch(backendurl + "/book/findall").then(response => {
        return response.json();
    }).then( books => {
		
        window.localStorage.setItem("userBookData", JSON.stringify(books));
        FillTableBooks(0, "All");
    })
}

// Fill table with reserved books
function FillTableBooks(tablePage, input)
{
    let booksInTable = 8;

	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userBookData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userBookSearchData);
	
    let bookTableHtml =
        `<colgroup>
			<col style="width:40%;">
			<col style="width:25%;">
			<col style="width:15%;">
			<col style="width:15%;">
			<col style="width:5%;">
		</colgroup>
		<thead>
			<tr>
				<th>Titel</th>
				<th>Auteur</th>
				<th>ISBN</th>
				<th>Tags</th>
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
        	let currentBook = JSON.stringify(book)
       		bookTableHtml += `<tr>
           	    <td>${book.bookTitle}</td>
                <td>${book.bookAuthor}</td>
                <td>${book.bookIsbn}</td>			
                <td>${TagArrayToString(book.bookTags)}</td>`;
				if (NotReservedOrOwned(book.bookTitle))
					bookTableHtml += `<td><button type="button" onclick='ReserveBook(${book.bookId})'>Reserveer</button></td>`;
				else
					bookTableHtml += `<td></td>`
			bookTableHtml += `</tr>`;;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("userBooks").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-userbooks").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationBooks(tablePage, booksInTable, input);
}

function createTablePaginationBooks(tablePage, itemsInTable, input)
{
	let data;
	if (input === "All")
    	data = JSON.parse(window.localStorage.userBookData);
	else if (input === "Search")
		data = JSON.parse(window.localStorage.userBookSearchData);
	
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
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableBooks(${prevButton}, '${input}')">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableBooks(${labelCount}, '${input}')">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableBooks(${nextButton}, '${input}')">Next &raquo;</label>`;
    
    document.getElementById("pagination-userbooks").innerHTML = paginationHTML;
}

function TagArrayToString(tagArray)
{
	let tags = "";
	for (let tag of tagArray)
	{
		let first = tag.charAt(0);
		first = first.toUpperCase();
		let last = tag.slice(1);
		tags += (first + last + ", ");
	}
	tags = tags.trimEnd();
	tags = tags.slice(0,-1);

	return tags
}

FetchUserBooks();

/*

	THIS PART OF THE SCRIPT IS TO RESERVE A BOOK
	IT TAKES THE USERS EMPLOYEEID AND SENDS
	THIS WITH THE BOOK ID TO THE DATABASE

*/

async function ReserveBook(bookId)
{
	let employeeId = localStorage.getItem("id");

	if (employeeId != null)
	{
		// book/reserve/bookId/employeeId
		let response = await fetch(backendurl + "/book/reserve/" + bookId + "/" + employeeId, {
        method: 'POST'
		}).catch(error => {
			alert('Er is iets fouts gegaan');
			console.error(error);
		});

		let str = await response.json();
		alert(str.response);
		FetchUserReserve();
		FetchUserBooks();
	}
	else
	{
		console.error("No employeeId has been found, user is not logged in properly");
		alert("Oh no, we messed up! Something went wrong fetching your ID");
	}
}

/*

	THIS PART OF THE SCRIPT IS TO SEARCH A BOOK
	FROM THE BOOK LIST, BASED ON TITLE, AUTHOR
	ISBN OR TAGS

*/

function UserSearchBook()
{
	let input = document.getElementById("userSearchBook").value.toLowerCase();
    let data = JSON.parse(window.localStorage.userBookData);

	if (input != "")
	{
		let foundData=[];

		for (let book of data)
		{
			if (CompareBookSearchData(book, input))
			{
				foundData.push(book);
			}
		}
	
        window.localStorage.setItem("userBookSearchData", JSON.stringify(foundData));
		FillTableBooks(0, "Search");
	}
	else
	{
		FillTableBooks(0, "All");
	}	
}

function CompareBookSearchData(book, input)
{
	let tags = "";
    
	for (let tag of book.bookTags)
		tags += tag;

	return (book.bookTitle.toLowerCase().includes(input) || book.bookAuthor.toLowerCase().includes(input) || book.bookIsbn.includes(input) || tags.toLowerCase().includes(input))
}



function NotReservedOrOwned(title)
{
	let reserved = JSON.parse(window.localStorage.userReserveData);
	let loaned = JSON.parse(window.localStorage.userLoanData);

	for (let book of reserved)
		if (book.bookTitle === title)
			return false;
	
	for (let book of loaned)
		if (book.bookTitle === title)
			return false;

	return true;
}