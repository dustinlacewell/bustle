Web API Overview
Steamworks Documentation > Web API Overview
Introduction
Steam exposes an HTTP based Web API which can be used to access many Steamworks features. The API contains public methods that can be accessed from any application capable of making an HTTP request, such as game client or server. The API also contains protected methods that require authentication and are intended to be accessed from trusted back-end applications.

As an example, Web API methods are commonly used by a secure publisher server to:
Verify a Steam user's credentials with that server
Check if a user owns a particular application
Set or retrieve a user's stats, achievements or leaderboard scores
Execute an in-game purchase

You can find a complete list of everything offered by the Steamworks Web API in the Steamworks Web API Reference.
Request Format
The public Steamworks Web API is accessed by making HTTP (port 80) or HTTPS (port 443) requests to api.steampowered.com.
If you're a publisher, then Steam also provides a partner-only Web API server hosted at https://partner.steam-api.com. The intent of this service is to have higher availability than the public host; you should use this service for all requests made from your secure servers. See Web API Host Addresses, Firewall Considerations for more information.

Similar to the Steamworks C++ API, the Web API has been divided into multiple interfaces that contain related methods. The URI format of each API request is:
https://api.steampowered.com/<interface>/<method>/v<version>/

Most methods support a list of required and optional parameters. Depending on the method, these parameters must be passed in as GET or POST params in the request.

All requests should be sent using HTTP 1.1 and use a secure TLS connection when possible. The Content-Type must be application/x-www-form-urlencoded and the POST parameters must be in the body of the request in standard form urlencoding format. Text must be transmitted as UTF-8.
Authentication
Many Web API methods have access restrictions which require a unique key, see Authentication using Web API Keys for more information.
Array Parameters
Some methods are expecting an array of parameters. This is specified by a [0] postfix on the parameter name. When passing arrays there will always be a count parameter that specifies the number of parameters in the array. For example:
?count=2&name[0]=SomeNameHere&name[1]=SomeOtherName
Service Interfaces
In addition to the regular web api calls are the service interfaces. These interfaces function very similarly to the regular interfaces, the primary difference being that all service APIs will accept their arguments as a single JSON blob in addition to taking them as GET or POST parameters. To pass in data as JSON, invoke the web API method with the input_json parameter set like:
?key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&input_json={"steamid":76561197972495328}

Note that the JSON will need to be URL-encoded. The "key" and "format" fields should still be passed as separate parameters, as before. POST requests are supported as well.

You can identify if a WebAPI is a "Service" by the name of the interface; if it ends in "Service" like IPlayerService, then it supports this additional method of passing parameter data. Some Service methods have parameters that have more complex structures and require this alternative input format.
Example Query
The following example retrieves the 3 most recent news entries for Team Fortress 2.
The request specifies that the response should be returned as JSON and includes: a required appid parameter (Team Fortress 2's AppID is 440), and an optional count parameter to limit the number of results returned.

GET /ISteamNews/GetNewsForApp/v2/?appid=440&count=3\r\n
Host: api.steampowered.com/r/n
Content-Length: 0\r\n\r\n

You can execute and view the results of this query with this link:
https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=3

You can read more about this specific call here: ISteamNews/GetNewsForApp
Obtaining the User's SteamID
The Steamworks Web API identifies individual users by using the their unique 64-bit Steam ID. To learn how to securely obtain the user's Steam ID, see User Authentication and Ownership.

Authentication using Web API Keys
Steamworks Documentation > Web API Overview > Authentication using Web API Keys
Some Web API methods return publicly accessible data and do not require authorization when called. Other methods may require you to use a unique API key. There are also methods that return sensitive data or perform a protected action and require special access permissions. These APIs require a publisher key, which you will need to create before calling any of them. In cases where an API key is required, it can be provided either as a standard parameter or by setting the 'x-webapi-key' request header value.
User Keys
The standard user keys are available to everyone, all that is required is a Steam account and the domain name that will be associated with this key.

You will also need to agree to the Steam Web API Terms of Use.

You can create a user Web API key from the registration page on the Steam Community.
Publisher Keys
To securely identify a publisher, and allow access to protected methods, a publisher may request a Web API key which can be passed to the appropriate methods using the key parameter. Each key is associated with a publisher group and can be used to access data for all of the App IDs that are also associated with that group. To receive a publisher Web API key, see Creating a Publisher Key below.

Publisher Web API keys provide access to sensitive user data and protected methods. These keys are intended to be used for Web API requests that originate from secure publisher servers. The keys must be stored securely, and must not be distributed with a game client. All Web API requests that contain Web API keys should be made over HTTPS.
Creating a Publisher Web API Key
To create a publisher Web API key, you will need to have administrator permissions within an existing Steamworks account. If you are not an administrator yourself, you can see a list of administrators for your partner account by visiting your Steamworks Home Page and viewing the list on the right-hand side. Any one of them can create your Publisher Web API Key or can promote you to admin if appropriate.

To create a Publisher Web API key:
As a user with administrative rights in your Steamworks account, first visit your groups list by going to Users & Permissions, then Manage Groups.
From the list of groups, select or create a group that contains the App IDs for which you wish to have access with the WebAPI key.
Then click into that group to view the users and applications in that group.
If you have administrative permissions, you should then see the option to "Create WebAPI Key" on the right-hand side. Or you should see the key listed if it has already been created.

Error Codes & Responses
Steamworks Documentation > Web API Overview > Error Codes & Responses
Response Formats
Every method in the Steamworks Web API is able to return responses in multiple formats. By default, all responses are returned JSON encoded. However, each request can optionally contain a format parameter to specify one of the following response formats.

Example:
http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=1&format=xml

The following values can be passed for this parameter:
JSON
The API always returns an object containing the named object with the result data.
Arrays are represented as an array with the name of the type of the objects in the array.
Null is represented as JSON's null.
64 bit numbers are returned as a string.
Example:
{
  "appnews": {
    "appid": 440,
    "newsitems": [
      {
        "gid": "1904306376092568991",
        "title": "Prince of Prolander Event ",
        "url": "http://store.steampowered.com/news/externalpost/tf2_blog/1904306376092568991",
        "is_external_url": true,
        "author": "",
        "contents": "<a href=/"http://rgl.gg/default.aspx/"><img src=/"https://steamcdn-a.akamaihd.net/steam/news/29555/prince.png?t=1495219023/"></a><br><br>/n<p><b>This Sunday at 4:30pm EST</b> <a href=/"http://rgl.gg/default.aspx/" target=\"_blank\">RGL.gg</a> is hosting their Prince of Prolander event. See legendary players <a href=/"https://www.youtube.com/user/stabbyvideo/" target=\"_blank\">Stabby</a> and <a href=/"https://www.youtube.com/user/danethebrain/" target=\"_blank\">Uncle Dane</a> duke it out to answer the age old question: Who is better? Spies or Engies? Come see them settle the score once and for all in the new competitive TF2 format, Pick/Ban Prolander. Be sure to tune in to <a href=/"https://www.twitch.tv/extvesports/" target=\"_blank\">Twitch</a> this Sunday, and witness this historic event!</p><br>",
        "feedlabel": "TF2 Blog",
        "date": 1495218420,
        "feedname": "tf2_blog",
        "feed_type": 0,
        "appid": 440
      }
    ],
    "count": 2385
  }
}

