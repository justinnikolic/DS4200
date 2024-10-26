// Load the data for both plots
d3.csv("iris.csv").then(function(data) {
    // Convert string values to numbers for both plots
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // ========== Part 2.1: Scatter Plot ==========

    // Define dimensions and margins for the scatter plot
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container for the scatter plot
    const svgScatter = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set up scales for x (Petal Length) and y (Petal Width) axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    // Create a color scale for the species
    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))])
        .range(d3.schemeCategory10);

    // Add circles for each data point in the scatter plot
    svgScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Species));

    // Add x-axis and y-axis for the scatter plot
    svgScatter.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svgScatter.append("g")
        .call(d3.axisLeft(yScale));

    // Add labels for x-axis and y-axis
    svgScatter.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Petal Length");

    svgScatter.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Petal Width");

    // Add a legend for the scatter plot
    const legend = svgScatter.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

    // ========== Part 2.2: Boxplot ==========

    // Create the SVG container for the boxplot
    const svgBox = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set up scales for the boxplot
    const xScaleBox = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Species))])
        .range([0, width])
        .padding(0.2);
    const yScaleBox = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .range([height, 0]);

    // Add x-axis and y-axis for the boxplot
    svgBox.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScaleBox));
    svgBox.append("g")
        .call(d3.axisLeft(yScaleBox));

    // Rollup function to calculate quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = q1 - 1.5 * iqr;
        const max = q3 + 1.5 * iqr;
        return { q1, median, q3, min, max };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw the boxes for each species in the boxplot
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScaleBox(Species);
        const boxWidth = xScaleBox.bandwidth();

        // Draw whiskers (vertical lines)
        svgBox.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBox(quartiles.min))
            .attr("y2", yScaleBox(quartiles.max))
            .attr("stroke", "black");

        // Draw the box (Q1 to Q3)
        svgBox.append("rect")
            .attr("x", x)
            .attr("y", yScaleBox(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScaleBox(quartiles.q1) - yScaleBox(quartiles.q3))
            .attr("fill", "lightgrey");

        // Draw median line
        svgBox.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBox(quartiles.median))
            .attr("y2", yScaleBox(quartiles.median))
            .attr("stroke", "black");
    });
});
