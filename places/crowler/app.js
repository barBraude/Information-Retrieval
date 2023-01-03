
const https = require('https');
const fs = require('fs');


const getPlaces = (search)=>
{
    var searchString = search.searchString;
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + searchString + "%20&key=AIzaSyDXyxeU1zX58LbAxxRvwzj3hdxjn26KWx4"

    const options = {
        method: 'GET'
    };
      
    let request = https.request(url, options, (res) => {
        if (res.statusCode !== 200) {
            console.error(`Did not get an OK from the server. Status Code: ${res.statusCode}`);
            res.resume();
            return;
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('close', () => {
            dataJson = JSON.parse(data)
            places = getPlacesIdFromResult(dataJson.results)
            
            if(dataJson.next_page_token)
            {
                getPlacesFromNextPage(dataJson.next_page_token, places, search)
            }
            else
            {
                getPlacesFullData(places, 0, search)
            }
        });
    });
    
    request.end();
    
    request.on('error', (err) => {
    console.error(`Got error when trying to make a request: ${err.message}`);
    });
}

const getPlacesIdFromResult = (results) =>
{
    var places = []
    var i = 0
    for(i=0; i<results.length; i++)
    {
        var place = {place_id: results[i].place_id, data: undefined}
        places.push(place)
    }

    return places
}

const getPlacesFromNextPage = (token, places, search)=>
{
    setTimeout(()=>{    
        var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyDXyxeU1zX58LbAxxRvwzj3hdxjn26KWx4&pagetoken=" + token
    
        const options = {
            method: 'GET'
        };
          
        let request = https.request(url, options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Did not get an OK from the server. Status Code: ${res.statusCode}`);
                res.resume();
                return;
            }
            
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('close', () => {
                dataJson = JSON.parse(data)
                var newPlaces = getPlacesIdFromResult(dataJson.results)
                var i = 0
                for(i=0; i<newPlaces.length; i++)
                {
                    places.push(newPlaces[i])
                }

                if(dataJson.next_page_token)
                {
                    getPlacesFromNextPage(dataJson.next_page_token, places, search)
                }
                else
                {
                    getPlacesFullData(places, 0, search)
                }
            });
        });
        
        request.end();
    
        request.on('error', (err) => {
        console.error(`Got error when trying to make a request: ${err.message}`);
        });
    }, 2000)
}

const getPlacesFullData = (places, index, search)=>
{
    if(places.length <= index)
    {
        places = getPlacesData(places);
        places = filterPlaces(places, search.filters);
        console.log(places);
        console.log("Places amount: ", places.length);
        var output = {search: search, amount_of_places: places.length, places: places}
        console.timeEnd();
        fs.writeFileSync(search.searchString + ".json", JSON.stringify(output));
        return
    }

    var url = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + places[index].place_id + "&key=AIzaSyDXyxeU1zX58LbAxxRvwzj3hdxjn26KWx4"

    const options = {
        method: 'GET'
    };
      
    let request = https.request(url, options, (res) => {
        if (res.statusCode !== 200) {
            console.error(`Did not get an OK from the server. Status Code: ${res.statusCode}`);
            res.resume();
            return;
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('close', () => {
            dataJson = JSON.parse(data)
            places[index].data = dataJson.result
            getPlacesFullData(places, index+1, search)
        });
    });
    
    request.end();

    request.on('error', (err) => {
    console.error(`Got error when trying to make a request: ${err.message}`);
    });
}

const getPlacesData = (placesFullData)=>
{
    var places = [];
    var i = 0;
    for(i=0; i<placesFullData.length; i++)
    {
        var place = {};
        place.place_id = placesFullData[i].place_id;
        place.rating = placesFullData[i].data.rating;
        place.name = placesFullData[i].data.name;
        place.amount_of_ratings = placesFullData[i].data.user_ratings_total;
        place.address = placesFullData[i].data.formatted_address;
        place.phone_number = placesFullData[i].data.formatted_phone_number;
        place.maps_url = placesFullData[i].data.url;
        place.website_url = placesFullData[i].data.website;
        place.opening_hours = placesFullData[i].data.opening_hours;
        place.location = [];
        if(placesFullData[i].data.geometry && placesFullData[i].data.geometry.location)
        {
            place.location.push(placesFullData[i].data.geometry.location.lat);
            place.location.push(placesFullData[i].data.geometry.location.lng);
        }
        places.push(place)
    }

    return places
}

const filterPlaces = (places, filters) => 
{
    var filteredPlaces = [];
    var i = 0;
    for(i=0; i < places.length; i++)
    {
        if(!
            (needToFilterByMinimumAmountOfRatings(places[i], filters) || 
            needToFilterByRatingsRange(places[i], filters) || 
            needToFilterByOpeningHoursRange(places[i], filters)))
        {
            filteredPlaces.push(places[i]);
        }
    }

    return filteredPlaces;
}

const needToFilterByMinimumAmountOfRatings = (place, filters) =>
{
    if(filters.minimum_amount_of_ratings) //if the filter exist
    {
        if(!place.amount_of_ratings) //if place has no ratings is undefined
        {
            return true;
        }
        
        if(place.amount_of_ratings < filters.minimum_amount_of_ratings)
        {
            return true;
        }
    }

    return false;
}

const needToFilterByRatingsRange = (place, filters) =>
{
    if(filters.rating_range) //if the filter exist
    {
        if(!place.rating) //if place has no rating is undefined
        {
            return true;
        }

        if(place.rating < filters.rating_range.from)
        {
            return true;
        }

        if(place.rating > filters.rating_range.to)
        {
            return true;
        }
    }

    return false;
}

const needToFilterByOpeningHoursRange = (place, filters) =>
{
    if(filters.opening_hours) //if the filter exist
    {
        if(!place.opening_hours || !place.opening_hours.periods || !place.opening_hours.periods[filters.opening_hours.day]) //if timeRange is no exist is undefined
        {
            return true;
        }

        var timeRange = place.opening_hours.periods[filters.opening_hours.day];
        var openingTime = timeRange.open.time;
        var closingTime = timeRange.close.time;

        if(timeCompare(filters.opening_hours.from, openingTime) < 0  ||
           (timeCompare(filters.opening_hours.to, closingTime) > 0  && 
           filters.opening_hours.day === timeRange.close.day)) //closing hour can be in the night after 00:00 (hence, it's another day)
        {
            return true;
        }
    }

    return false;
}

//return 1 if time1 > time2, 0 if time1 = time2, or -1 if time2 > time1
const timeCompare = (time1, time2) =>
{
    var time1Hour = parseInt(time1.trim().substring(0,2), 10);
    var time2Hour = parseInt(time2.trim().substring(0,2), 10);
    var time1Minutes = parseInt(time1.trim().substring(2,4), 10);
    var time2Minutes = parseInt(time2.trim().substring(2,4), 10);

    if(time1Hour > time2Hour)
    {
        return 1;
    }
    else if(time1Hour < time2Hour)
    {
        return -1;
    }

    if(time1Minutes > time2Minutes)
    {
        return 1;
    }
    else if(time1Minutes < time2Minutes)
    {
        return -1;
    }

    return 0;
}




//# query region  
console.time();

var filters = {
    rating_range: {
        from: 2.5, 
        to: 5.0
    },
    minimum_amount_of_ratings: 5,
    opening_hours: {
        day: 3, 
        from: "1400", 
        to: "1600"
    }
}

var searchString = "haifa resturant";

var search = {searchString: searchString, filters: filters}
getPlaces(search)

//#query endregion
