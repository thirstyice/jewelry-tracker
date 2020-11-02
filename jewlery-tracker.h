//
// Copyright (C) 2020 Tauran Wood
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>
//

#pragma once

#include <string>
#include <ctime>

class JewleryTracker {
private:

public:
	const static std::string tasks [] {
		"Polishing",
		"QCing",
		"Setting",
		"Sanding"
	};
	enum info {TYPE,GAUGE,METAL,SIZE};

	const static std::string jewlery [][][] {
		//0 type         1 gauge                  2 metal                      3 size
		{{"Labrets"},    {"14g","16g"},           {"Stainless","Titanium"},    {"1/4","5/16","3/8"},        },
		{{"CBRs"},       {"14g"},                 {"Stainless","Titanium"},    {"5/16","3/8","7/16","1/2"}, },
		{{"Barbells"},   {"N/A"},                 {"Titanium"},                {"7/16","9/16","3/4"},       },
		{{"Threadless"}, {"14g","16g"},           {"Titanium"},                {"1/4","5/16"},              },
		{{"Gems"},       {"14g","White","Clear"}, {"Fauxpal","Bezel","Disks"}, {"3mm","4mm"},               },
	};
	int currentTask=-1;
	int currentItem[4]={-1,-1,-1,-1};
	int completed [][][][];
	JewleryTracker ();
	virtual ~JewleryTracker ();

	bool working=false;
	bool dayStarted=false;
	std::time_t startTime;
	std::clock_t itemStartTime;

	void startDay();
	void stopDay();
	void pauseWork();
	void startWork();

	void completeCurrentItem();

	void selectTask(int task);
	void selectType(int type);
	void selectGauge(int gauge);
	void selectMetal(int metal);
	void selectSize(int size);
};
