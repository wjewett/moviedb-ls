document.getElementById('search').addEventListener('click', function() {
  var value = document.getElementById('search-box').value;
  getMovies(value);

});
document.getElementById('clear-search').addEventListener('click', function() {
  document.getElementById('output').innerHTML = '';
  document.getElementById('search-box').value = '';
});

let movieDB = [];
var row = '';
var databaseFile = null;

function populateMovieList(movies){
  if(movies.length > 0){
    loadEventListeners();
    document.getElementById("alert-container").innerHTML = ``;
    storeMovies(movies);
    let html = '';
    movies.forEach(function(movie){
      html += `
      <tr id="row-${movies.indexOf(movie)+1}">
        <td>${movies.indexOf(movie)+1}</td>
        <td>${movie.title}</td>
        <td>${movie.rating}</td>
        <td>${movie.release}</td>
        <td>${movie.runtime}</td>
        <td>${movie.genre}</td>
        <td>${movie.res}</td>
        <td>${movie.format}</td>
        <td><a class="imdb-logo" href="https://www.imdb.com/title/${movie.IMDb}" target="_blank"><img src="imdb-logo.png" alt="imdb-logo"></a></td>
        <td><a class="" data-toggle="modal" data-target="#modal-${movie.IMDb}"><i class="fa fa-pencil" id="edit-${movie.IMDb}" aria-hidden="true"></i></a>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o" id="delete-${movie.IMDb}" aria-hidden="true"></i></td>
      </tr>`;
    });
    // Insert into the DOM
    document.querySelector('.table-body').innerHTML = html;
    if(movies.length == 1){
      document.getElementById('totalMovies').textContent = movies.length + " movie";
    } else {
      document.getElementById('totalMovies').textContent = movies.length + " movies";
    }
    movies.forEach(function(movie){
      document.getElementById(`delete-${movie.IMDb}`).addEventListener('click', function(){
        deleteMovie(movie.IMDb);
      });
      document.getElementById(`edit-${movie.IMDb}`).addEventListener('click', function(){
        editMovie(movies.indexOf(movie));
      });

      drawModals(movieDB.indexOf(movie));
    });

    var div = document.getElementById('div-modals');
    div.innerHTML = row;
    // document.body.insertBefore(div, null);

  } else {
    document.getElementById("alert-container").innerHTML = `
    <div class="alert alert-danger" role="alert">
      You have no movies in your database. Search for movies to add.
    </div>`;
  }
}

// Get from Movies external API
function getMovies(search) {
  var url = `http://www.omdbapi.com/?s=${search}&apikey=thewdb`;
  fetch(url)
    .then(function(res){
      return res.json();
    })
    .then(function(data) {
      var results = data.Search;
      let output = '';
      let IMDbArray = [];
      results.forEach(function(user) {
        if(user.Type==="movie"){
          if(IMDbArray.includes(user.imdbID)) {   
            console.log("Movie already displayed");
          } else {  
            output += `
            <div class="card mb-2 mr-3" style="max-width: 423px;">
              <div class="row no-gutters">
                <div class="col-md-4">
                  <img src="${user.Poster}" class="card-img">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title"><strong>${user.Title}</strong></h5>
                    <p class="card-text"><a class="float-left" href="https://www.imdb.com/title/${user.imdbID}" target="_blank"><img src="imdb-logo.png" alt="imdb-logo"></a></p>
                    <p class="card-text text-center"><strong>Released: ${user.Year}</strong></p>
                      <p class="formats">Resolution:<br>
                        <input type="checkbox" id="sd-${user.imdbID}" name="resolution">
                        <label for="sd-${user.imdbID}">DVD/SD</label>
                        <input type="checkbox" id="hd-${user.imdbID}" name="resolution">
                        <label for="hd-${user.imdbID}">Blu-ray/HD</label>
                        <input type="checkbox" id="uhd-${user.imdbID}" name="resolution">
                        <label for="uhd-${user.imdbID}">4K/UHD</label>
                        Format:<br>
                        <input type="checkbox" id="disc-${user.imdbID}" name="format" value="">
                        <label for="disc-${user.imdbID}">Disc</label>
                        <input type="checkbox" id="digital-${user.imdbID}" name="format">
                        <label for="digital-${user.imdbID}">Digital</label>
                      <br>
                      <span id="change-${user.imdbID}"><button id="${user.imdbID}" class="add-btn text-center btn btn-sm btn-primary">Add to MovieDB</button></span></p>
                  </div>
                </div>
              </div>
            </div>
            `;
            IMDbArray.push(user.imdbID);
          }
        }
      });
      document.getElementById('output').innerHTML = output;
      results.forEach(function(user){
        if(user.Type==="movie"){
          document.getElementById(`${user.imdbID}`).addEventListener('click', function() {
            addMovie(user.imdbID);
          });
        }
      });
    })
    .catch(function(err){
      console.log(err);
    });
} 

// Get selected Movie imdb search from external API
function addMovie(imdb) {
  if (movieDB.some(e => e.IMDb === imdb)) {
    /* movies contains the imdb ID already */
    console.log("Duplicate");
    document.getElementById(`change-${imdb}`).innerHTML = `<button class="btn-pressed btn-sm btn btn-warning">Movie Already Exists</button>`;
    return movieDB;
  }
  document.getElementById(`change-${imdb}`).innerHTML = `<button class="btn-pressed btn-sm btn btn-success">Movie Added</button>`;
  const url = `http://www.omdbapi.com/?i=${imdb}&apikey=thewdb`;

  var formRes = getFormatResolution(document.getElementById("sd-"+imdb).checked, document.getElementById("hd-"+imdb).checked, document.getElementById("uhd-"+imdb).checked, document.getElementById("disc-"+imdb).checked, document.getElementById("digital-"+imdb).checked);

  fetch(url)
    .then(function(res){
      return res.json();
    })
    .then(function(data) {
      let results = data;
      const newMovie = {title: results.Title, rating: results.Rated, runtime: results.Runtime, release: results.Released, genre: results.Genre, format: formRes.format, res: formRes.res, IMDb: imdb};
      movieDB.push(newMovie);
      sortMovies(movieDB);
      for (let index = 0; index < movieDB.length-1; index++) {
        if(movieDB[index].IMDb === movieDB[index+1].IMDb){
          movieDB = movieDB.splice(index+1,1);
        }
      }
      populateMovieList(movieDB);
      return newMovie;
    })
    .catch(function(err){
      console.log(err);
    });
} 

function deleteMovie(imdb){
  movieDB.forEach(function(movie){
    if(imdb == movie.IMDb){
      movieDB.splice(movieDB.indexOf(movie), 1);
    }
  });
  storeMovies(movieDB);
  if(movieDB.length == 0){
    document.location.reload();
  } else {
  populateMovieList(movieDB);
  }
}

function drawModals(index) {

  row += `
  <div class="modal fade" id="modal-${movieDB[index].IMDb}" tabindex="-1" role="dialog" aria-labelledby="${movieDB[index].IMDb}-Label" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="${movieDB[index].IMDb}-Label">Update <strong>${movieDB[index].title}:&nbsp</strong></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">

        <p class="formats">
        Genre: <input type="text" class="modal-genre" id="genre-${movieDB[index].IMDb}" name="genre" value="${movieDB[index].genre}">
        <br>
        <br>
        Resolution:
        <input type="checkbox" id="sd-${movieDB[index].IMDb}" name="resolution">
        <label for="sd-${movieDB[index].IMDb}">DVD/SD</label>
        <input type="checkbox" id="hd-${movieDB[index].IMDb}" name="resolution">
        <label for="hd-${movieDB[index].IMDb}">Blu-ray/HD</label>
        <input type="checkbox" id="uhd-${movieDB[index].IMDb}" name="resolution">
        <label for="uhd-${movieDB[index].IMDb}">4K/UHD</label><br><br>
        Format:
        <input type="checkbox" id="disc-${movieDB[index].IMDb}" name="format" value="">
        <label for="disc-${movieDB[index].IMDb}">Disc</label>
        <input type="checkbox" id="digital-${movieDB[index].IMDb}" name="format">
        <label for="digital-${movieDB[index].IMDb}">Digital</label>
        </p>

        </div>
        <div class="modal-footer">
          <button type="button" id="close-${movieDB[index].IMDb}" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" id="save-${movieDB[index].IMDb}" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
  `;

}

function editMovie(index){


  document.getElementById(`close-${movieDB[index].IMDb}`).addEventListener('click', function() {
  });
  document.getElementById(`save-${movieDB[index].IMDb}`).addEventListener('click', function() {
    var newFormRes = getFormatResolution(document.getElementById("sd-"+movieDB[index].IMDb).checked, document.getElementById("hd-"+movieDB[index].IMDb).checked, document.getElementById("uhd-"+movieDB[index].IMDb).checked, document.getElementById("disc-"+movieDB[index].IMDb).checked, document.getElementById("digital-"+movieDB[index].IMDb).checked);
    movieDB[index].genre = document.getElementById(`genre-${movieDB[index].IMDb}`).value;
    movieDB[index].format = newFormRes.format;
    movieDB[index].res = newFormRes.res;
    document.getElementById(`close-${movieDB[index].IMDb}`).click(); 
    populateMovieList(movieDB);
  });

  
}

function storeMovies(movies) {
  let items = [];
  items = movies;
  localStorage.setItem('movies', JSON.stringify(items));
}

function getStoredMovies() {
  if(JSON.parse(localStorage.getItem('movies')) == null){
    populateMovieList(movieDB);
  } else {
    movieDB = JSON.parse(localStorage.getItem('movies'));
    populateMovieList(movieDB);
  }
}

function emptyDatabase() {
  movieDB = [];
  storeMovies(movieDB);
  document.location.reload();
}

function makeDatabaseFile(movies) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(movies));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "movies.json");
  document.body.appendChild(downloadAnchorNode); 
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}  

function loadEventListeners() {
  document.getElementById("bottom-btn").innerHTML = `
  <button class="btn btn-info" id="download-btn">Export Database</button>
  <button class="btn btn-info" id="empty">Remove all movies</button>`;
  document.getElementById('empty').addEventListener('click', function() {
    document.getElementById("bottom-btn").innerHTML = `
    <button class="btn btn-info" id="download-btn">Export Database</button>
    <button class="btn btn-warning" id="confirm">Are you sure?</button>`;
    document.getElementById('confirm').addEventListener('click', function() {
      document.getElementById("bottom-btn").innerHTML = `
      <button class="btn btn-info" id="download-btn">Export Database</button>
      <button class="btn btn-danger" id="double-confirm">Last chance to rethink</button>`;
      document.getElementById('double-confirm').addEventListener('click', function() {
        emptyDatabase();
      });
    });
  });

  var download = document.getElementById('download-btn');

  download.addEventListener('click', function () {
    makeDatabaseFile(movieDB);    
  }, false);
}
var upload = document.querySelector(".file");
upload.addEventListener('change', function() {
  readDatabaseFile(upload);
})

function readDatabaseFile(upload) {
  document.getElementById('import-btn').innerHTML = `
  <button class="btn btn-warning text-left" id="import">Import Selected File</button>`;
  document.getElementById('import').onclick = function() {
    var files = document.getElementById('selectFiles').files;
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();

  fr.onload = function(e) { 
  console.log(e);
    var result = JSON.parse(e.target.result);
    var stringMovies = JSON.stringify(result, null, 2);
    movieDB = JSON.parse(stringMovies);
    console.log(movieDB);
    storeMovies(movieDB);
    populateMovieList(movieDB);
    document.getElementById('import-btn').innerHTML = '';
  }

  fr.readAsText(files.item(0));
  };
}

function getSortTitle(name) {
  var sortTitle = '';
  var articles = ['THE', 'A', 'AN'];
  if (articles.includes(name.substr(0,name.indexOf(' ')).toUpperCase())) {
    sortTitle = name.substr(name.indexOf(' ')+1);
  } else {
    sortTitle = name;
  }
  return sortTitle;
}

function sortMovies(movies){
  movies.sort(function(a, b) {
    var textA = getSortTitle(a.title.toUpperCase());
    var textB = getSortTitle(b.title.toUpperCase());
    return (textA < textB) ? -1 : ((textA > textB) ? 1 : 0);
});
}

function getFormatResolution(sd, hd, uhd, disc, digital){
  let format, resolution;
  let formatRes = {};
  format = resolution = '';
  // check for format
  if(sd) {
    if(hd && uhd) {
      resolution = "SD/HD/UHD";
    } else if (hd) {
      resolution = "SD/HD";
    } else {
      resolution = "SD";
    }
  } else if(hd) {
    if(uhd){
      resolution = "HD/UHD";
    } else {
      resolution = "HD";
    }
  } else if (uhd) {
    resolution = "UHD";
  }
  // check digital or disc
  if(disc == true && digital) {
    format = "disc/digital";
  } else if(disc && !digital){
    format = "disc";
  } else if(digital){
    format = "digital";
  }
  formatRes.format = format;
  formatRes.res = resolution;

  return formatRes;
}


getStoredMovies();