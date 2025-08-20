import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Use media-query-based theming instead of a .dark class selector
// Define theme keys explicitly
 type ThemeKeys = "light" | "dark";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ThemeKeys, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  const lightVars = colorConfig
    .map(([key, itemConfig]) => {
      const color = (itemConfig as any).theme?.light ?? itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join("\n")

  const darkVars = colorConfig
    .map(([key, itemConfig]) => {
      const color = (itemConfig as any).theme?.dark ?? itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join("\n")

  const css = `
[data-chart=${id}] {
${lightVars}
}
@media (prefers-color-scheme: dark) {
  [data-chart=${id}] {
${darkVars}
  }
}
`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={{
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties}
                        />
                      )
                    )}
                    <div className="grid gap-0.5">
                      {nestLabel ? tooltipLabel : null}
                      <div className="text-foreground">{itemConfig?.label}</div>
                      {typeof item?.value === "number" ? (
                        <div className="font-mono font-medium tabular-nums text-muted-foreground">
                          {item.value.toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  const payloadPayload = payload?.payload || {}

  const configLabelKey = `${key}Label` as keyof typeof config
  const configIconKey = `${key}Icon` as keyof typeof config
  const configColorKey = `${key}Color` as keyof typeof config

  const label = config[configLabelKey]
  const icon = config[configIconKey]
  const color = config[configColorKey]

  return {
    label: label?.label || payload.name || key,
    icon: icon?.icon,
    color: color?.color,
  }
}

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    content?: React.ComponentProps<typeof RechartsPrimitive.Legend>["content"]
    nameKey?: string
  }
>(({ className, content, nameKey }, ref) => {
  const { config } = useChart()

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)}>
      {config &&
        Object.entries(config).map(([name, item]) => {
          const key = `${nameKey || name}`
          return (
            <div key={key} className="inline-flex items-center gap-2">
              {item?.icon ? <item.icon /> : <div className="h-2.5 w-2.5 rounded-[2px] bg-[--color-${key}]" />}
              <span className="text-sm text-muted-foreground">{item?.label || key}</span>
            </div>
          )
        })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-4", className)} {...props} />
))
ChartLegendContent.displayName = "ChartLegendContent"

const ChartStyleGradient = ({
  id,
  color = "",
  offset = [0, 100],
}: {
  id: string
  color?: string
  offset?: [number, number]
}) => {
  return (
    <RechartsPrimitive.Defs>
      <RechartsPrimitive.LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
        <RechartsPrimitive.Stop offset={`${offset[0]}%`} stopColor={`var(--color-${color})`} stopOpacity={0.8} />
        <RechartsPrimitive.Stop offset={`${offset[1]}%`} stopColor={`var(--color-${color})`} stopOpacity={0} />
      </RechartsPrimitive.LinearGradient>
    </RechartsPrimitive.Defs>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
