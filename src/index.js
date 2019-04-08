// It might be a good idea to add event listener to make sure this file
// only runs after the DOM has finshed loading.

document.addEventListener('DOMContentLoaded', domLoadFunctions)

function domLoadFunctions(){
  const quoteUl = document.getElementById("quote-list")
  document.addEventListener('click', clickHandler)
  document.addEventListener('submit', submitHandler)
  fetchQuotes()

  //handles a click request
  function clickHandler(e){
    const typeButton = e.target.classList.value
    const id = parseInt(e.target.parentNode.parentNode.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id)
    if (id && typeButton === 'btn-success'){likeButtonClicked(id)}
    if (id && typeButton === 'btn-warning'){renderEditButton(id)}
    if (id && typeButton === 'btn-danger'){deleteQuote(id)}
  }

  //finds all quotes from dom, then calls the render function
  function fetchQuotes(){
    fetch('http://localhost:3000/quotes')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      renderAllQuotes(myJson);
    });}

  //renders one quote
  function renderQuote(quoteObject){
    newLi = document.createElement("li")
    newLi.innerHTML =
    `
      <li class='quote-card' data-id='${quoteObject.id}'>
        <blockquote class="blockquote">
          <p class="mb-0">${quoteObject.quote}</p>
          <footer class="blockquote-footer">${quoteObject.author}</footer>
          <br>
          <button class='btn-success'>Likes: <span>${quoteObject.likes}</span></button>
          <button class='btn-warning'>Edit</button>
          <button class='btn-danger'>Delete</button>
        </blockquote>
      </li>
    `
    quoteUl.appendChild(newLi)
  }

  //renders all quotes using above function
  function renderAllQuotes(myJson){
    quoteUl.innerHTML = ''
    myJson.forEach(quoteObj => renderQuote(quoteObj))
  }

  //Handles all form submissions. If it's an edit form, reroutes to edit the quote, otherwise, reroutes to post a new quote.
  function submitHandler(e){
    e.preventDefault()
    const id = e.target.parentNode.parentNode.dataset.id
    const quote = document.getElementById('new-quote').value
    const author = document.getElementById('author').value
    if (e.target.id === "new-quote-form"){postNewQuote(quote, author)}
    if (e.target.id === "edit-quote-form"){editQuote(id, quote, author)}
  }

  // Posts a new quote using quote and author
  function postNewQuote(quote, author){
    fetch('http://localhost:3000/quotes', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quote: quote,
          author: author,
          likes: 0})
        })
    .then(response => response.json())
    .then(fetchQuotes)
  }

  // checks how many likes it currently has via the dom, and then adds one more like to that
  function likeButtonClicked(id){
    const likes = parseInt(document.querySelector(`[data-id='${id}']`).querySelector("span").innerText)
    patchNewLike(id, likes)
  }

  // adds a like to the current number of likes
  function patchNewLike(id, likes){
    fetch(`http://localhost:3000/quotes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          likes: likes+1})
        })
    .then(response => response.json())
    .then(fetchQuotes)
  }

  // deletes a quote by its id
  function deleteQuote(id){
    fetch(`http://localhost:3000/quotes/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
        })
    .then(response => response.json())
    .then(fetchQuotes)
  }

// Pops out an edit button when people hit "edit", rendering their previous information
  function renderEditButton(id){
    // finds relevant quote block to render the edit button in
    const quoteBlock = document.querySelector(`[data-id="${id}"]`)
    //takes old quote from the dom
    const quote = quoteBlock.querySelector(".mb-0").innerText
    //takes old author from the dom
    const author = quoteBlock.querySelector(".blockquote-footer").innerText
    //pops out the edit form underneath the relevant quote
    const newDiv = document.createElement("DIV")
    newDiv.innerHTML = `<form id="edit-quote-form">
      <div class="form-group">
        <label for="new-quote">New Quote</label>
        <input type="text" class="form-control" id="new-quote" placeholder="Learn. Love. Code.">
      </div>
      <div class="form-group">
        <label for="Author">Author</label>
        <input type="text" class="form-control" id="author" placeholder="Flatiron School">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>`
    // sets the quote and the author inside the form
    newDiv.querySelector("#new-quote").value = quote
    newDiv.querySelector("#author").value = author
    // appends the whole form to the quote
    quoteBlock.appendChild(newDiv)
  }

  function editQuote(id, quote, author){
    // sends the patch request
    fetch(`http://localhost:3000/quotes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quote: quote,
          author: author})
        })
    .then(response => response.json())
    .then(fetchQuotes)
  }
}
