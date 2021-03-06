## DXF API JSON Output

The DXF API is a function that receives 2 parameters:
* Remote file url for DXF
* Included Colors (hex color code)

Here is a preview of what an example output looks like:

```
{
    "x_extents": 28.977,
    "y_extents": 12.727,
    "included_colors": {
        "colors": [
            {
                "name": "#00FF00",
                "length": 72.333,
                "area": 282.869
            }
        ],
        "total_length": 72.333
    },
    "excluded_colors": {
        "colors": [
            {
                "name": "Empty",
                "length": 0,
                "area": 0
            }
        ],
        "total_length": 0
    },
    "image": "Base64 Encoded Image text here",
    "unsupported_types": "none",
    "missing_colors": "none",
    "message": "Success!"
}
```
The output has 7 different keys:
* x_extents
    * X Extent of DXF File
* y_extents
    * Y Extent of DXF File
* included_colors
* excluded_colors
* image
    * Base64 Encoded Image text representing the DXF file
* unsupported_types
    * Text representing any entities not covered by the DXF parser
    * Currently covers LINE, POLYLINE, LWPOLYLINE, SPLINE, CIRCLE, ELLIPSE, and ARC types
* missing_colors
    * List representing missing hex color values from the included parameter
* message
    * Text displaying API status

The included_colors and excluded_colors keys are a nested JSON object and have **2** children keys each, **colors** which denotes a list of colors with their hex values and length/area calculations and **total_length** which denotes the sum length of entities represented in the colors key.

## API Connector

To connect the API to your Bubble application, you will first need to install the API Connector plugin in bubble. Go to the Plugins tab -> + Add Plugins -> search for API Connector and install.

Upon installing you need to initialize an API call so Bubble knows what types of data it's returning. This can be done in the Plugins tab when you click on API Connector. Go ahead and click on 'Add another API'.

We need to first define an API and give it a name, let's call it DXF. Click on 'Add a shared header' to add a header for the type of data being returned, in this case, an application/json type. Your API should look like this now:
![image](./readmeimages/init-api.png)

Once we've defined the API, we need to add a call which is essentially a function that will take parameters and return the important data that we need. Let's rename API call to DXF API and expand the box. Our API call is a POST API meaning we send data to the server and create a resource, our return JSON. Set the request type from GET to POST. Our API url resides on https:<span></span>//bubble-dxf-parser.herokuapp.com/remoteurl, so fill the box next to it with that. It should look like this now:
![image](./readmeimages/api-url.png)

We now need to fill in the parameters being sent to the API call so head towards the 'Body' box to add our 2 inputs: url and included.
```
{
    "url": "https:<url>",
    "included": "<included>"
}
```
These parameters are defined in a JSON format where each line is a key/value pair (key is on the left of the colon and value is on the right). For example, the "url" key points to a value of "https:\<url\>". Make sure to enclose keys and values with quotes to follow the JSON schema.  

Each of these values are enclosed in "<>" which means the value is dynamic, so we can set the value to whatever we want in the Bubble app (use a Bubble element value to fill the value). The "url" key looks different since Bubble uploads files and returns the file location as "//s3.amazonaws.com/filestuff.dxf". The "https:" placed at the front just makes it a valid url our endpoint can use.

**Make sure to uncheck the private box for all key/value pairs**. At this point, the API call is finished being defined and your API should look like this:
![image](./readmeimages/api-body.png)

Go ahead and initialize the call by pressing "Initialize call" at the bottom and your API is now defined on Bubble!
![image](./readmeimages/api-return-data.png)

## Using API call in Bubble
* ### Example external API call for extents on Text Box:
To grab data from the API, simply insert dynamic data -> Get data from an external API -> choose 'DXF - DXF API' as the API provider -> fill in the parameters -> use x_extents. Fill in a separator and repeat the process choosing y_extents this time. It should look like this:
![image](./readmeimages/api-text-example.png)

* ### Example external API call on Repeating Group:
We'll use the same approach as the text box example. Set the Data Source first by: Get data from an external API -> choose 'DXF - DXF API' as the API provider -> fill in the parameters -> use colors. We then choose the Type of Content, either 'DXF API included_colors color' or 'DXF API excluded_colors color' depending on what you need. It should look like this:
![image](./readmeimages/api-rg-example.png)

included_colors color will be a list of color calculations with fields name, length, and area data. You can display these in your Repeating Group with 3 text boxes representing each field like so:
![image](./readmeimages/api-rg-cell-example.png)

* ### Example external API call for Button/Workflow:
First add a workflow for the button press. We can display the API data using Element Actions -> Group/Display data or Repeating Group/Display list. It works the same as above, Data to Display will be: Get data from an external API -> choose 'DXF - DXF API' as the API provider -> fill in the parameters. It should look like this:
![image](./readmeimages/api-workflow-example.png)

## Heroku/GitHub
The server is currently hosted thru Heroku using free-tier dynos. This means that the server shuts down if there is 30 minutes of inactivity (no server calls are made). On the next server call, it will take additional time to produce an output: server wake up time + DXF parsing time. Hobby-tier dynos can always be used to keep the server up 24/7 at a cost of $7/month.

The current iteration deployed by Heroku is connected to the GitHub repository [here](https://github.com/howardwang0620/bubble-dxf-parser). Any code changes pushed to this repo will redeploy the Heroku server.

In the event of reconnecting the Heroku application to another GitHub repository, visit the Heroku deploy settings [here](https://dashboard.heroku.com/apps/bubble-dxf-parser/deploy/github) and scroll down to the section **App connected to GitHub**. Disconnect the repository and then connect the new repository you wish to make future changes to.
