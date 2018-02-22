const WIDTH = 900;
const HEIGHT = 550;
const PADDING = 100;
const TOOLTIP_PADDING = 20;
const DOT_SIZE = 6;

document.addEventListener('DOMContentLoaded', function() {
  request = new XMLHttpRequest();
  request.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
  request.send();
  request.onload = function() {
    // Acquire US GDP dataset
    json = JSON.parse(request.responseText);
    createScatterplot(json);
  }
});

// Create a scatterplot given the data provided
function createScatterplot(dataset) {
  // Acquire a function that will linearly scale the numbers in the dataset
  // to numbers that can be used to represent the data in the graph
  const minYear = d3.min(dataset, d => d.Year);
  const maxYear = d3.max(dataset, d => d.Year);
  const xScale = d3.scaleLinear()
                   .domain([minYear-1, maxYear+1])
                   .range([PADDING, WIDTH-PADDING]);

  const slowestTime = d3.max(dataset, d => d.Time);
  const fastestTime = d3.min(dataset, d => d.Time);
  const yScale = d3.scaleLinear()
                   .domain([clockToNumber(slowestTime), clockToNumber(fastestTime)])
                   .range([HEIGHT-PADDING, PADDING/2])

  // Creates a tooltip that displays data when bar is hovered over
  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip");

  // Create the svg element
  const svg = d3.select('#scatterplot')
                .append('svg')
                .attr('width', WIDTH)
                .attr('height', HEIGHT);

  // Plot the dataset onto the svg canvas
  svg.selectAll('circle')
     .data(dataset)
     .enter()
     .append('circle')
     .attr('cx', d => xScale(d.Year))
     .attr('cy', d => yScale(clockToNumber(d.Time)))
     .attr('r', DOT_SIZE)
     .attr('fill', d => d.Doping === '' ? 'orange':'#0982bb')
     .style('stroke', 'black')
     .on("mouseover", function(d) {
          const nameAndNation = d.Name + ': ' + d.Nationality;
          const yearAndTime = 'Year: ' + d.Year + ', ' + 'Time: ' + d.Time;
          const allegation = d.Doping;
          const content = nameAndNation + ' <br> ' + yearAndTime + ' <br> ' + allegation;

          tooltip.style("visibility", "visible")
                 .html(content)
       })
       .on("mousemove", () => tooltip.style("left",(event.pageX+TOOLTIP_PADDING)+"px").style("top", (event.pageY-TOOLTIP_PADDING)+"px"))
       .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Create x-axis for graph
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  svg.append('g')
     .attr('transform', 'translate(0, ' + (HEIGHT-PADDING) + ')')
     .call(xAxis);

  // Create y-axis for graph
  const yAxis = d3.axisLeft(yScale)
  svg.append('g')
     .attr('transform', 'translate(' + PADDING + ', 0)')
     .call(yAxis);
}

// Converts a string that represents a time to a number representing the
// same time. Example: clockToNumber('36:30') returns 36.5
function clockToNumber(clockTime) {
  const SEC_IN_MIN = 60;

  const minSec = clockTime.split(":");
  const min = parseInt(minSec[0]);
  const sec = parseInt(minSec[1])/SEC_IN_MIN;

  return min + sec;
}

// Converts a number representing time to a string representing the same time
// Example: numberToClock(36.5) returns '36:30'
function numberToClock(numTime) {
  const min = Math.floor(numTime);
  const sec = Math.round((numTime - min) * 60);

  return min + ':' + sec;
}


