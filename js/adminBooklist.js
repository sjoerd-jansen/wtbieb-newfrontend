// import { saveBoekName } from "./userOverview.js";

function saveBoekName(boekid) {
    localStorage.setItem("boekid", boekid)
    console.log("giving data" + boekid)
}

function resetTablinksClass(standardClassName, secondaryClassName) {
    var tablinks = document.getElementsByClassName(standardClassName);
   	for (i = 0; i < tablinks.length; i++) {
		console.log("after", tablinks[i].className);
		tablinks[i].className = standardClassName + " " + secondaryClassName;
	}
}

// Recolor the tabs once a tab button has been pushed 
function openPage(pageName, element, color) {
    var backgroundColor = "#D3D3D3";
	var standardClassName = "header-button";
	var primaryClassName = "tablink-primary";
    var i, tabcontent, tablinks;

    // Hide all the contents of the tabs
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // document.getElementById("Overzicht").style.display = "none";
    // document.getElementById("Boekenlijst").style.display = "none";
    // document.getElementById("Medewerkers").style.display = "none";
    
	// Reset the tab buttons color to the background color
    resetTablinksClass(standardClassName, "tablink");

	// Visualise the content of the clicked tab and set the classname (and thus color) of the current tab-button 
    document.getElementById(pageName).style.display = "block";
    //const container = getElementsById(pageName, )
    // console.log(document.getElementById(pageName));
	element.className = standardClassName + " " + primaryClassName
}

function saveBook(book) {
    console.log("currenbook " + book);
    book = JSON.stringify(book);
    console.log("currenbook " + book);
    localStorage.setItem("currentBook", book);
}

function openDefaultBookAdmin(book) {
    saveBook(book);
    window.location = "../html/defaultAdminBookPage.html"
}

function dataRowToHtml(r) {
    let wrappedBook = JSON.stringify(r);
    let htmlRow = ``;
    htmlRow += `<tr>
            
            <td onclick='openDefaultBookAdmin(${wrappedBook})'>${r.bookId}</td>
            <td onclick='openDefaultBookAdmin(${wrappedBook})'>${r.bookTitle}</td>
            <td onclick='openDefaultBookAdmin(${wrappedBook})'>${r.bookAuthor}</td>
            <td onclick='openDefaultBookAdmin(${wrappedBook})'>${r.bookIsbn}</td>`
    htmlRow += `<td onclick='openDefaultBookAdmin(${wrappedBook})'>${r.bookCopies}</td>`;
    htmlRow += `<td> <button id="updateBookButton${r.bookId}" type="button" onclick='updateBook(${wrappedBook})'>Pas boek aan</button>
                </td>

                <td> <button id="deleteBook${r.bookId}" type="button" onclick='deleteBook(${wrappedBook})'>Verwijder</button>
                </td>`;
    // htmlRow += `<td></td>`;
    htmlRow += `<td></td>
                      </tr>`;
    return htmlRow;
}

function createTablePagination(tablePage, itemsInTable, input) {
	let data;
	if (input === "All")
		data = JSON.parse(window.localStorage.bookData);
	else
		data = JSON.parse(window.localStorage.bookSearchData);

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
    let paginationHTML = `<label for="table_radio_3" onclick='vulTabel(${prevButton}, "${input}")'>&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick='vulTabel(${labelCount}, "${input}")'>${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick='vulTabel(${nextButton}, "${input}")'>Next &raquo;</label>`;
    
    document.getElementById("pagination-booklist").innerHTML = paginationHTML;
}

function vulTabel(tablePage, input) {
    let booksInTable = 8;
	
	let data;
	if (input === "All")
		data = JSON.parse(window.localStorage.bookData);
	else
		data = JSON.parse(window.localStorage.bookSearchData);

    let colleagueId = localStorage.getItem("id");
    
    let bookTableHtml =
        `   <colgroup>
				<col style="width:2%;">
				<col style="width:40%;">
				<col style="width:23%;">
				<col style="width:15%;">
				<col style="width:10%;">
				<col style="width:5%;">
				<col style="width:5%;">
	  		</colgroup>
			<thead>
                <tr>
                    <th>ID</th>
                    <th>Titel</th>
                    <th>Auteur</th>
                    <th>ISBN</th>
                    <th>Beschikbaar</th>
					<th></th>
					<th></th>
                 </tr>
            </thead>
            <tbody>`;

    let bookCount = 0;
    let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let r of data) {
        if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable) {
            bookTableHtml += dataRowToHtml(r);
        }

        bookCount++;
    }

    bookTableHtml += `  </tbody>`;

    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;
    
    // Setting innerHTML of corresponding divs 
    document.getElementById("book-table").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePagination(tablePage, booksInTable, input);
}

async function haalboekenOp()
{
    // await fetch("https://workingtalentbieb.azurewebsites.net:8082/book/findall").then(response => {
    await fetch(backendurl + "/book/findall").then(response => {
        return response.json();
    }).then( d => {
        // Stringify the object as only strings can be stored in localstorage
        window.localStorage.setItem("bookData", JSON.stringify(d));

        vulTabel(0, "All");
    })
}

haalboekenOp();

function openBookForm(bookFormId, buttonId, newText, oldText) {
    openScreenmask();
    document.getElementById(bookFormId).style.display = "flex";
    document.getElementById(buttonId).innerHTML = newText;
    document.getElementById(buttonId).onclick = function () { closeBookForm(bookFormId, buttonId, oldText, newText, onclickFunction); };
}

function closeBookForm(bookFormId, buttonId, newText, oldText) {
    document.getElementById(bookFormId).style.display = "none";
    document.getElementById(buttonId).innerHTML = newText;
    // document.getElementById(buttonId).onclick = function () { onclickFunction };
    document.getElementById(buttonId).onclick = function () { openBookForm(bookFormId, buttonId, oldText, newText) };

}

// Create new unique book (if it doesn't already exist)
async function createBook(divTohideId) {
    // Read the values filled in the form
    let titleInput = document.getElementById('bookTitle').value;
    let authorInput = document.getElementById('bookAuthor').value;
    let isbnInput = document.getElementById('bookIsbn').value;
    let amountInput = document.getElementById('bookAmount').value;
    let tagInput = document.getElementById('bookTags').value;

    let filteredTags = [];
    tagInput = tagInput.split(",").forEach(x => {
        filteredTags.push(x.trim());
    });
    filteredTags.forEach(x => console.log(x))
    // Maak ik een book object in javascript
    let newBook = {
        bookTitle: titleInput,
        bookAuthor: authorInput,
		bookIsbn: isbnInput,
        bookTags: filteredTags,
    }

    let response = await fetch(backendurl + "/book/new/" + amountInput, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
    })
    .catch(error => {
        alert('Er is iets fouts gegaan');
    });

	let str = await response.json();
	alert(str.response);
	haalboekenOp();

    document.getElementById(divTohideId).style.display = "none";
}

function submitUpdateBook(bookId, changeBookTitleId, changeBookAuthorId, changeBookIsbnId, changeBookTagsId, divTohideId) {
    console.log( "update submit "+ bookId + " " + (changeBookTitleId.value));
    // Formulier uitlezen
    let idInput = bookId;
    console.log(document.getElementById(changeBookTitleId));
    let titleInput = changeBookTitleId.value;
    let authorInput = changeBookAuthorId.value;
    let isbnInput = changeBookIsbnId.value;
    let tagsInput = changeBookTagsId.value;
    tagsInput = tagsInput.split(",");

    if (idInput != null)
    {
        // Maak ik een person object in javascript
        let updateBook = {
            bookTitle: titleInput,
            bookAuthor: authorInput,
            bookIsbn: isbnInput,
            bookTags: tagsInput,
        }

        fetch(backendurl + "/book/" + idInput + "/update", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateBook)
        })
        .then(response => {
            haalboekenOp();
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });
    }
    document.getElementById(divTohideId).style.display = "none";
}


// Update existing book
function updateBook(book) {
    let changeBookTitleId = "changeBookTitle";
    let changeBookAuthorId = "changeBookAuthorId";
    let changeBookIsbnId = "changeBookIsbnId";
    let changeBookTagsId = "changeBookTagsId";

    let wrappedBook = JSON.stringify(book);

    openScreenmask();

    let formHtml = `
                <form class="">
                    <h1>${book.bookTitle} aanpassen</h1>
                    <label for="Titel"><b>Titel</b></label>
                    <input id="${changeBookTitleId}" class="book-input" type="text" placeholder="The lord of the Rings" name="titel">

                    <label  for="Auteur"><b>Auteur</b></label>
                    <input id="${changeBookAuthorId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="auteur">

                    <label for="ISBN"><b>ISBN</b></label>
                    <input id="${changeBookIsbnId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="isbn">
                    
                    <label for="Tags"><b>Tags</b></label>
                    <input id="${changeBookTagsId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="isbn">
                </form>
                <button id="submitUpdate" type="button" onclick='submitUpdateBook(${book.bookId}, ${changeBookTitleId}, ${changeBookAuthorId}, ${changeBookIsbnId}, ${changeBookTagsId}, "change-book-form")'>Pas aan
`;
    document.getElementById("change-book-form").innerHTML = formHtml;
    document.getElementById("change-book-form").style.display = "flex";
    document.getElementById(changeBookTitleId).value = book.bookTitle;
    document.getElementById(changeBookAuthorId).value = book.bookAuthor;
    document.getElementById(changeBookIsbnId).value = book.bookIsbn;
    document.getElementById(changeBookTagsId).value = book.bookTags;

    // document.getElementById(`updateBookButton${book.bookId}`).innerHTML = "Sluiten";
    localStorage.setItem("lastChangeButton", `updateBookButton${book.bookId}`);

    return;
}

function closeForm(formId) {
    document.getElementById(formId).style.display = "none";
}

async function submitDeleteBook(book, formId, copyIds, copyIdsPrefix)
{
    copyIds.forEach(async copyId => {
        if (document.getElementById(copyIdsPrefix + copyId).checked)
		{
            book.copyId = copyId;
            let response = await fetch(backendurl + "/book/archive/" + copyId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .catch(error => {
                alert('Er is iets fouts gegaan');       
			});

			let str = await response.json();
			alert(str.response);
			haalboekenOp();
			closeForm("delete-book-form");
        }
    });
}

async function deleteBook(book) {
    let copyIds = [];
    let copyCheckboxes = "";
    await fetch(`http://localhost:8082/book/${book.bookId}/copies/`).then(response => {
            return response.json();
    }).then(data =>{
        data.forEach(b => {
            copyIds.push(b.copyId)
            copyCheckboxes += `<input type="checkbox" id="deleteCheckbox${b.copyId}"`
            if (b.copyArchived)
                copyCheckboxes += "checked"
            copyCheckboxes += `> ${b.copyId}</input>`;
        })
    }).catch(e => alert("Er is iets misgegaan met ophalen " + e));

    let wrappedCopyIds = JSON.stringify(copyIds)
    let formHtml = `
                    <form class="">
                        <h1>${book.bookTitle} verwijderen?</h1>
                        ${copyCheckboxes}

                    </form>
                    <button id="submitDelete" type="button" onclick='submitDeleteBook(${book.bookId}, "delete-book-form", ${wrappedCopyIds}, "deleteCheckbox")'>Ja
                    <button id="" type="button" onclick='closeForm("delete-book-form")'>Nee
    `;
    openScreenmask();
    document.getElementById("delete-book-form").innerHTML = formHtml;
    document.getElementById("delete-book-form").style.display = "flex";
}

function openScreenmask() {
    document.getElementById("screenmask").style.display = "";
}

function hideMenus() {
    let bookFormId = "new-book-form";
    closeBookForm(bookFormId, "new-book-button-top", "Boek toevoegen", "Sluiten");
    document.getElementById(bookFormId).style.display = "none";
    document.getElementById("screenmask").style.display = "none";
    
    let changeFormId = "change-book-form";
    document.getElementById(changeFormId).style.display = "none";
    // document.getElementById(localStorage.getItem("lastChangeButton")).innerHTML = "Pas boek aan";

    closeForm("delete-book-form");

}



function SearchBooks()
{
	let input = document.getElementById("searchBooks").value.toLowerCase();
    let data = JSON.parse(window.localStorage.bookData);

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
	
        window.localStorage.setItem("bookSearchData", JSON.stringify(foundData));
		vulTabel(0, "Search");
	}
	else
	{
		vulTabel(0, "All");
	}	
}

function CompareBookSearchData(book, input)
{
	let tags = "";
    
	for (let tag of book.bookTags)
		tags += tag;

	return (book.bookTitle.toLowerCase().includes(input) || book.bookAuthor.toLowerCase().includes(input) || book.bookIsbn.includes(input) || tags.toLowerCase().includes(input))
}
