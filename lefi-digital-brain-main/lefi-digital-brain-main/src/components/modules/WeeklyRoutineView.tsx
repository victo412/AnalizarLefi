import React from "react";

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

type Block = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color?: string;
};

type WeeklyRoutineProps = {
  routine: Record<string, Block[]>;
};

export const WeeklyRoutineView: React.FC<WeeklyRoutineProps> = ({ routine }) => (
  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
    {daysOfWeek.map((day) => (
      <div key={day} className="bg-white rounded-lg shadow p-3 min-h-[120px] flex flex-col">
        <div className="font-semibold mb-2">{day}</div>
        {routine[day]?.length ? (
          routine[day].map((block) => (
            <div
              key={block.id}
              className="mb-2 px-2 py-1 rounded"
              style={{ background: block.color || "#e5e7eb" }}
            >
              <div className="text-sm font-medium">{block.title}</div>
              <div className="text-xs text-gray-500">
                {block.start_time} - {block.end_time}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-400">Sin bloques</div>
        )}
      </div>
    ))}
  </div>
); 