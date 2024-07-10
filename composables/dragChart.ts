import * as am5 from "@amcharts/amcharts5";

import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import am5themes_dark from "@amcharts/amcharts5/themes/Dark";
import am5themes_responsive from "@amcharts/amcharts5/themes/Responsive";

export const useDragChart = () => {
  let root: am5.Root | null = null;
  const el = ref("");
  const data = ref<any>([]);

  function drawing() {
    if (!el.value) return;

    if (!root) root = am5.Root.new(el.value);

    changeTheme();

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/

    let yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 30 });
    yRenderer.grid.template.set("location", 1);

    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "country",
        renderer: yRenderer,
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        renderer: am5xy.AxisRendererX.new(root, {
          visible: true,
          strokeOpacity: 0.1,
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "value",
        sequencedInterpolation: true,
        categoryYField: "country",
      })
    );

    let columnTemplate = series.columns.template;

    columnTemplate.setAll({
      draggable: true,
      cursorOverStyle: "pointer",
      tooltipText: "drag to rearrange",
      cornerRadiusBR: 10,
      cornerRadiusTR: 10,
      strokeOpacity: 0,
    });

    columnTemplate.adapters.add("fill", (fill, target) => {
      if (chart) {
        const colors = chart.get("colors");
        if (colors) {
          const columnIndex = series.columns.indexOf(target);
          if (columnIndex !== -1) {
            return colors.getIndex(columnIndex);
          }
        }
      }
      return fill; // Si algo no está definido, regresamos el valor original
    });

    columnTemplate.events.on("dragstop", () => {
      sortCategoryAxis();
    });

    // Get series item by category
    function getSeriesItem(category: any) {
      for (var i = 0; i < series.dataItems.length; i++) {
        var dataItem = series.dataItems[i];
        if (dataItem.get("categoryY") == category) {
          return dataItem;
        }
      }
    }

    // Axis sorting
    function sortCategoryAxis() {
      // Sort by value
      series.dataItems.sort(function (x, y) {
        const graphicsX = x.get("graphics");
        const graphicsY = y.get("graphics");

        if (graphicsX && graphicsY) {
          return graphicsY.y() - graphicsX.y();
        }
        return 0; // Otra opción de manejo si alguna propiedad es undefined
      });

      var easing = am5.ease.out(am5.ease.cubic);

      // Go through each axis item
      am5.array.each(yAxis.dataItems, function (dataItem) {
        // get corresponding series item
        let seriesDataItem = getSeriesItem(dataItem.get("category"));

        if (seriesDataItem) {
          // get index of series data item
          let index: any = series.dataItems.indexOf(seriesDataItem);

          let column: any = seriesDataItem.get("graphics");

          // position after sorting
          let fy =
            yRenderer.positionToCoordinate(yAxis.indexToPosition(index)) -
            column.height() / 2;

          // set index to be the same as series data item index
          if (index != dataItem.get("index")) {
            dataItem.set("index", index);

            // current position
            let x = column.x();
            let y = column.y();

            column.set("dy", -(fy - y));
            column.set("dx", x);

            column.animate({ key: "dy", to: 0, duration: 600, easing: easing });
            column.animate({ key: "dx", to: 0, duration: 600, easing: easing });
          } else {
            column.animate({ key: "y", to: fy, duration: 600, easing: easing });
            column.animate({ key: "x", to: 0, duration: 600, easing: easing });
          }
        }
      });

      // Sort axis items by index.
      // This changes the order instantly, but as dx and dy is set and animated,
      // they keep in the same places and then animate to true positions.
    }

    yAxis.data.setAll(data);
    series.data.setAll(data);

    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
  }

  function dispose() {
    if (root) {
      root.dispose();
      root = null;
    }
  }

  onUnmounted(() => {
    dispose();
  });

  function changeTheme() {
    root?.setThemes([
      am5themes_Animated.new(root),
      am5themes_responsive.new(root),
      am5themes_dark.new(root),
    ]);
  }

  return {
    drawing,
    dispose,
    data,
    el,
  };
};
