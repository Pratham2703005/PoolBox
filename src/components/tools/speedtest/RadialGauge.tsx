"use client";
import React from 'react';
import GaugeComponent from 'react-gauge-component';

interface RadialGaugeProps {
    value: number;
    maxValue: number;
    label: string;
    unit: string;
    color: string;
    icon?: React.ReactNode;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
    value,
    maxValue,
    label,
    unit,
    color,
    icon
}) => {
    // Color variants based on prop
    const colorVariants: { [key: string]: { primary: string; text: string; bg: string } } = {
        green: {
            primary: '#10b981',
            text: 'text-green-600',
            bg: 'bg-green-50'
        },
        blue: {
            primary: '#3b82f6',
            text: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        purple: {
            primary: '#8b5cf6',
            text: 'text-purple-600',
            bg: 'bg-purple-50'
        },
    };

    const colors = colorVariants[color] || colorVariants.green;

    return (
        <div className={`bg-zinc-900 p-6 rounded-2xl border-1 border-${color}-200 `}>
            <div className="flex flex-col items-center">
               

                <GaugeComponent
                    type="radial"
                    labels={{
                        tickLabels: {
                            type: "inner",
                            ticks: [
                                { value: 20 },
                                { value: 40 },
                                { value: 60 },
                                { value: 80 },
                                { value: 100 }
                            ]
                        }
                    }}
                    arc={{
                        colorArray: ['#5BE12C', '#EA4228'],
                        subArcs: [{ limit: 10 }, { limit: 30 }, {}, {}, {}],
                        padding: 0.02,
                        width: 0.3
                    }}
                    pointer={{
                        elastic: true,
                        animationDelay: 0
                    }}

                    //   arc={{
                    //     colorArray: ['#FF2121', '#FFA500', colors.primary],
                    //     padding: 0.02,
                    //     subArcs: [
                    //       { limit: 20 },
                    //       { limit: 40 },
                    //       { limit: 60 },
                    //       { limit: 100 }
                    //     ]
                    //   }}
                    //   pointer={{
                    //     type: "blob",
                    //     animationDelay: 0
                    //   }}
                    //   labels={{
                    //     valueLabel: {
                    //       formatTextValue: (value) => value.toFixed(value >= 10 ? 1 : 2),
                    //       style: {
                    //         fontSize: '35px',
                    //         fill: colors.primary,
                    //         textShadow: 'none'
                    //       }
                    //     },
                    //     tickLabels: {
                    //       type: "inner",
                    //       ticks: [
                    //         { value: 0 },
                    //         { value: 20 },
                    //         { value: 40 },
                    //         { value: 60 },
                    //         { value: 80 },
                    //         { value: 100 }
                    //       ]
                    //     }
                    //   }}
                    value={value > maxValue ? maxValue : value}
                    minValue={0}
                    maxValue={maxValue}
                />

                {/* Label */}
                <div className="mt-2 text-center w-full">
                    <div className='flex gap-2 justify-center items-center'>
                        {icon && (
                            <div className={`${colors.text}`}>
                                {icon}
                            </div>
                        )}
                        <p className={`text-lg font-semibold ${colors.text}`}>
                            {label}
                        </p>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                        {value.toFixed(value >= 10 ? 1 : 2)} {unit}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RadialGauge;
