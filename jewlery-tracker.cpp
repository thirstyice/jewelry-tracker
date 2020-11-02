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


#include "jewlery-tracker.h"


void JewleryTracker::startDay() {
	if (dayStarted) {
		return;
	}
	startTime=std::time(nullptr);
	dayStarted=true;
}

void JewleryTracker::stopDay() {
	if (!dayStarted) {
		return;
	}

}

void JewleryTracker::pauseWork() {
	working=false;
}

void JewleryTracker::startWork() {
	for (int i; i< (sizeof currentItem); i++) {
		if (currentItem[i]==-1) {
			return;
		}
	}
	if (currentTask==-1) {
		return;
	}
	itemStartTime=std::clock();
	working=true;

}

void JewleryTracker::completeCurrentItem() {
	if (!working) {
		startWork();
		return;
	}
	double itemDuration=(std::clock() - itemStartTime) / (double) CLOCKS_PER_SEC;
}

void JewleryTracker::selectTask(int task) {
	currentTask=task;
}

void JewleryTracker::selectType(int type) {
	currentItem[TYPE]=type;
}

void JewleryTracker::selectGauge(int gauge) {
	currentItem[GAUGE]=gauge;
}

void JewleryTracker::selectMetal(int metal) {
	currentItem[METAL]=metal;
}

void JewleryTracker::selectSize(int size) {
	currentItem[SIZE]=size;
}
