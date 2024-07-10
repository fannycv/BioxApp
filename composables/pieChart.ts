import * as am5 from "@amcharts/amcharts5";

import * as percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import am5themes_dark from "@amcharts/amcharts5/themes/Dark";
import am5themes_Spirited from "@amcharts/amcharts5/themes/Spirited";
import am5themes_responsive from "@amcharts/amcharts5/themes/Responsive";

export const usePieChart = () => {
  let root: am5.Root | null = null;
  const el = ref("");
  const data = ref<any>([]);

  const extendedLabel = ref<boolean>(false);
  const extendedLabelText = ref<string>("");
  const widthLegend = ref<boolean>(true);

  function drawing() {
    if (!el.value) return;

    if (!root) root = am5.Root.new(el.value);

    changeTheme();

    let chart = root.container.children.push(
      percent.PieChart.new(root, {
        innerRadius: 60,
        layout: root.verticalLayout,
        paddingLeft: 80,
        paddingRight: 80,
      })
    );

    let series = chart.series.push(
      percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "name",
        endAngle: 270,
      })
    );

    series.slices.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0xffffff),
    });

    let tooltip = am5.Tooltip.new(root, {
      labelText: `{category}: \n[bold]{valuePercentTotal.formatNumber('0.00')}%[/]({value}${extendedLabelText.value})`,
    });

    tooltip.get("background")?.setAll({
      fillOpacity: 0.6,
      strokeWidth: 0,
      strokeOpacity: 0,
    });

    series.labels.template.setAll({
      tooltip,
      text: `{category}:\n[bold]{valuePercentTotal.formatNumber('0.0')}%  ${
        extendedLabel.value ? `{value} ${extendedLabelText.value}` : ""
      }`,
      tooltipText:
        "{category}:\n[bold]{valuePercentTotal.formatNumber('0.00')}%[/]{value}${extendedLabelText.value}",
      ellipsis: "...",
      maxWidth: 100,
      oversizedBehavior: "wrap-no-break",
      textAlign: "left",
      fontSize: 15,
    });

    series.labels.template.setup = function (target) {
      target.set(
        "background",
        am5.Rectangle.new(root!, {
          fill: am5.color(0x000000),
          fillOpacity: 0,
        })
      );
    };

    series.slices.template.setAll({
      strokeWidth: 4,
      stroke: am5.color("#fff"),
      tooltipText:
        "{category}: {valuePercentTotal.formatNumber('0.00')}% ({value})",
    });

    series.data.setAll(data.value);

    // Leyenda
    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
      })
    );

    legend.labels.template.setAll({
      fontSize: 10,
      maxWidth: 120,
      ellipsis: "...",
      oversizedBehavior: "wrap-no-break",
      textAlign: "left",
    });

    legend.valueLabels.template.setAll({ fontSize: 10 });
    legend.data.setAll(series.dataItems);

    // ----
    series.appear(1000, 100);
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
    extendedLabel,
    extendedLabelText,
    widthLegend,
  };
};
