// This directive is based on code from https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936

export default function quotaPie() {
  return {
    restrict: 'E',
    scope: {
      value: '<'
    },
    template: '<svg viewBox="-1 -1 2.1 2.1" style="transform: rotate(-90deg); height: 15px"></svg>',
    link: function(scope, element) {
      const svgEl = element[0].querySelector('svg');

      const slices = [
        {
          percent: scope.value,
          color: 'Coral'
        },
        {
          percent: 1 - scope.value,
          color: '#00ab6b'
        },
      ];
      let cumulativePercent = 0;

      function getCoordinatesForPercent(percent) {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
      }

      slices.forEach(slice => {
        // destructuring assignment sets the two variables at once
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

        // each slice starts where the last slice ended, so keep a cumulative percent
        cumulativePercent += slice.percent;

        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

        // if the slice is more than 50%, take the large arc (the long way around)
        const largeArcFlag = slice.percent > .5 ? 1 : 0;

        // create an array and join it just for code readability
        const pathData = [
          `M ${startX} ${startY}`, // Move
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
          `L 0 0`, // Line
        ].join(' ');

        // create a <path> and append it to the <svg> element
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', pathData);
        pathEl.setAttribute('fill', slice.color);
        svgEl.appendChild(pathEl);
      });
    }
  };
}
