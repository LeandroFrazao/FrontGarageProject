import React, { Component } from "react";
import { useState, useEffect } from "react";
import { Location } from "./Location";

export const userInfo = () => {
  const { locationData } = Location();
  let [userData, setUserData] = useState({
    name: null,
    email: null,
    key: null,
  });
  let [currencyData, setCurrencyData] = useState({
    rate: [null],
    date: null,
  });

  // function to fecth api to get information of the country   // I im gonna implement extra information on the app later.
  const getCountrydata = async (country) => {
    console.log("Inside fecht CountryData");
    await fetch(`https://restcountries.eu/rest/v2/name/${country}`)
      .then((response) => response.json())
      .then((json) =>
        setCountryData({
          name: json[0].name,
          capital: json[0].capital,
          altSpelling: json[0].altSpellings[2],
          region: json[0].region,
          subregion: json[0].subregion,
          population: json[0].population,
          demonym: json[0].demonym,
          area: json[0].area,
          timezones: json[0].timezones,
          borders: json[0].borders,
          nativeName: json[0].nativeName,
          callingCodes: json[0].callingCodes,
          currencyCode: json[0].currencies[0].code,
          currencyName: json[0].currencies[0].name,
          languages: json[0].languages,
          flag: json[0].flag,
        })
      )
      .catch((error) => alert(error));
  };

  // function that fetch api to get currency rates
  const getCurrencyData = async () => {
    console.log("Inside fecht Currency");
    await fetch(`https://api.exchangeratesapi.io/latest?base=USD`)
      .then((response) => response.json())
      .then((json) => [
        setCurrencyData({
          date: json.date,
          rate: json.rates,
        }),
      ])
      .catch((error) => alert(error));
  };

  //call the function when locationData.country changes
  useEffect(() => {
    if (locationData.country) {
      getCountrydata(locationData.country);
    }
  }, [locationData.country]);

  //call the function every 5 minutes, or if the locationData.country changes
  useEffect(() => {
    if (locationData.country) {
      getCurrencyData();
      let clockCall = setInterval(() => {
        getCurrencyData();
      }, 300000); //every 5 minute, it updates
      return () => clearInterval(clockCall);
    }
  }, [locationData.country]);

  return { ...userInfo, userData };
};
