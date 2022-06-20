let boekID = localStorage.getItem("boekid")
console.log("http://localhost:8080/book/findsingle/"+boekID)

function haalOverZicht() {
    fetch("http://localhost:8080/book/findsingle/"+boekID).then(response => {
        return response.json();
    }).then( d => {
        document.getElementById("bookId").innerHTML = d.id
        document.getElementById("bookTitle").innerHTML = d.bookTitle
        document.getElementById("bookAuthor").innerHTML = d.bookAuthor
        document.getElementById("bookIsbn").innerHTML = d.bookIsbn
        document.getElementById("bookCopies").innerHTML = d.bookCopies
    })
}

haalOverZicht();


