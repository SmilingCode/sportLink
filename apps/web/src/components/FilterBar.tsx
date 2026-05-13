"use client";

export default function FilterBar() {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400">
        <option>Within 10 km</option>
        <option selected>Within 20 km</option>
        <option>Within 60 km</option>
      </select>
      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400">
        <option>All sports</option>
        <option>Soccer</option>
        <option>Basketball</option>
        <option>Volleyball</option>
        <option>Spikeball</option>
      </select>
      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400">
        <option>Any skill level</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Competitive</option>
      </select>
      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400">
        <option>Any gender</option>
        <option>Open</option>
        <option>Men</option>
        <option>Women</option>
        <option>Mixed</option>
      </select>
    </div>
  );
}
