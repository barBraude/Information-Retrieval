import { Component, OnInit } from '@angular/core';
import { backendService } from './backend.service';
import { Search } from './models/search.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'places';
  public searchString: string = "";


  constructor(public backendService: backendService) {}


  ngOnInit()
  {
    // this.getPlaces(); 
  }


  getPlaces()
  {
    var search: Search = {searchString: "haifa resturants", filters: {}};
    this.backendService.getPlaces(search).subscribe((data) =>
    {
      var places = data.places;
      window.alert(places.length);
    }, (err) => {window.alert(err.message);});
  }
}