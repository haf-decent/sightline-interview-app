import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function MultiSelectFilter({
	label,
	options,
	selected,
	onChange,
}: {
	label: string;
	options: string[];
	selected: string[];
	onChange: (value: string[]) => void;
}) {
	const [open, setOpen] = useState(false);

	const toggle = (option: string) => {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else {
			onChange([...selected, option]);
		}
	};

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 min-w-[160px] justify-between"
			>
				<span className="truncate text-left">
					{selected.length === 0
						? `All ${label}s`
						: selected.length === 1
							? selected[0]
							: `${selected.length} ${label}s`}
				</span>
				<ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
			</button>

			{open && (
				<>
					{/* backdrop */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setOpen(false)}
					/>
					<div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
						{selected.length > 0 && (
							<button
								onClick={() => onChange([])}
								className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border-b border-gray-100"
							>
								Clear selection
							</button>
						)}
						{options.map((option) => (
							<label
								key={option}
								className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
							>
								<input
									type="checkbox"
									checked={selected.includes(option)}
									onChange={() => toggle(option)}
									className="rounded"
								/>
								<span className="truncate">{option}</span>
							</label>
						))}
					</div>
				</>
			)}
		</div>
	);
}
