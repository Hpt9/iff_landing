import React from 'react'
import { TbCalendarFilled } from "react-icons/tb";

export const Card = ({ event }) => {
  return (
    <a href={event.link} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-[100%] md:max-w-[370px] flex flex-col h-[268px] relative group cursor-pointer">
      <img src={event.imagePath} alt={event.title} className="w-full h-[215px] object-cover group-hover:scale-115 transition-all duration-400" />
      <div className="flex flex-col h-[110px] p-[16px] rounded-[16px] bg-[#F5F5F5] absolute bottom-0 left-0 right-0">
        <div className="text-[16px] font-medium text-[#252525]">{event.title} </div>
        <div className="text-[16px] font-medium text-[#252525]">{event.time}</div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-base font-medium gap-2">
            {/* Calendar Icon (Heroicons outline) */}
            <TbCalendarFilled className="w-[24px] h-[24px] text-[#7E7E7E]" />
            <span className="text-[#7E7E7E]">{event.date}</span>
          </div>
          <button className="border border-gray-300 rounded-full w-[56px] h-[40px] flex items-center justify-center hover:bg-gray-100 relative bottom-[10px] group group-hover:border-[#42AB5D] transition-all duration-400">
            {/* Arrow Top Right Icon (Heroicons outline) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:rotate-45 transition-all duration-400 group-hover:text-[#42AB5D]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75l7.5-7.5m0 0H9.75m6 0v6" />
            </svg>
          </button>
        </div>
      </div>
    </a>
  )
}
