<style lang="scss" scoped>
#changeContab {
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;

    

    .el-tabs {
        box-shadow: none;
        max-height: none !important;
        height: auto !important;
    }

    .el-tabs__content {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
    }

    .tabBody {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;

        .el-row {
            margin: 10px 0;
            display: block !important;

            .long {
                .el-select {
                    width: 350px;
                }
            }

            .el-input-number {
                width: 110px;
            }
        }
    }

    .bottom {
        width: 100%;
        text-align: center;
        margin-top: 5px;
        position: relative;

        .value {
            font-size: 18px;
            vertical-align: middle;
        }
    }
}

/* 确保所有选项卡内容完全显示 */
.el-tabs__content>div {
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
}

/* 特别处理天选项卡，确保所有选项完整显示 */
.el-tab-pane {
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
}

/* 确保单选组能够正确显示 */
.el-radio-group {
    display: block !important;
    margin-bottom: 8px;
}

.el-select {
    width: 50%;
}
</style>
<template>
    <div id="changeContab">
        <el-tabs type="border-card">
            <el-tab-pane v-if="!config || config.showSecond !== false">
                <span slot="label"><i class="el-icon-date"></i> {{ text.Seconds.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio disabled v-model="second.cronEvery" label="1">{{ text.Seconds.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio disabled v-model="second.cronEvery" label="2">{{ text.Seconds.interval[0] }}
                            <el-input-number disabled size="small" v-model="second.incrementIncrement" :min="1"
                                :max="60"></el-input-number>
                            {{ text.Seconds.interval[1] || '' }}
                            <el-input-number disabled size="small" v-model="second.incrementStart" :min="0"
                                :max="59"></el-input-number>
                            {{ text.Seconds.interval[2] || '' }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio disabled class="long" v-model="second.cronEvery" label="3">{{ text.Seconds.specific }}
                            <el-select disabled size="small" multiple v-model="second.specificSpecific">
                                <el-option v-for="(val, index) in 60" :key="index" :value="val - 1">{{ val - 1
                                    }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio disabled v-model="second.cronEvery" label="4">{{ text.Seconds.cycle[0] }}
                            <el-input-number disabled size="small" v-model="second.rangeStart" :min="1"
                                :max="60"></el-input-number>
                            {{ text.Seconds.cycle[1] || '' }}
                            <el-input-number disabled size="small" v-model="second.rangeEnd" :min="0"
                                :max="59"></el-input-number>
                            {{ text.Seconds.cycle[2] || '' }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> {{ text.Minutes.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio v-model="minute.cronEvery" label="1">{{ text.Minutes.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="minute.cronEvery" label="2">{{ text.Minutes.interval[0] }}
                            <el-input-number size="small" v-model="minute.incrementIncrement" :min="1"
                                :max="60"></el-input-number>
                            {{ text.Minutes.interval[1] }}
                            <el-input-number size="small" v-model="minute.incrementStart" :min="0"
                                :max="59"></el-input-number>
                            {{ text.Minutes.interval[2] || '' }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="minute.cronEvery" label="3">{{ text.Minutes.specific }}
                            <el-select size="small" multiple v-model="minute.specificSpecific">
                                <el-option v-for="(val, index) in 60" :key="index" :value="val - 1">{{ val - 1
                                    }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="minute.cronEvery" label="4">{{ text.Minutes.cycle[0] }}
                            <el-input-number size="small" v-model="minute.rangeStart" :min="1"
                                :max="60"></el-input-number>
                            {{ text.Minutes.cycle[1] }}
                            <el-input-number size="small" v-model="minute.rangeEnd" :min="0"
                                :max="59"></el-input-number>
                            {{ text.Minutes.cycle[2] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> {{ text.Hours.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio v-model="hour.cronEvery" label="1">{{ text.Hours.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="hour.cronEvery" label="2">{{ text.Hours.interval[0] }}
                            <el-input-number size="small" v-model="hour.incrementIncrement" :min="0"
                                :max="23"></el-input-number>
                            {{ text.Hours.interval[1] }}
                            <el-input-number size="small" v-model="hour.incrementStart" :min="0"
                                :max="23"></el-input-number>
                            {{ text.Hours.interval[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="hour.cronEvery" label="3">{{ text.Hours.specific }}
                            <el-select size="small" multiple v-model="hour.specificSpecific">
                                <el-option v-for="(val, index) in 24" :key="index" :value="val - 1">{{ val - 1
                                    }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="hour.cronEvery" label="4">{{ text.Hours.cycle[0] }}
                            <el-input-number size="small" v-model="hour.rangeStart" :min="0"
                                :max="23"></el-input-number>
                            {{ text.Hours.cycle[1] }}
                            <el-input-number size="small" v-model="hour.rangeEnd" :min="0" :max="23"></el-input-number>
                            {{ text.Hours.cycle[2] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> {{ text.Day.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="1">{{ text.Day.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="2">{{ text.Day.intervalWeek[0] }}
                            <el-input-number size="small" v-model="week.incrementIncrement" :min="1"
                                :max="7"></el-input-number>
                            {{ text.Day.intervalWeek[1] }}
                            <el-select size="small" v-model="week.incrementStart">
                                <el-option v-for="(val, index) in 7" :key="index" :label="text.Week[val - 1]"
                                    :value="val"></el-option>
                            </el-select>
                            {{ text.Day.intervalWeek[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="3">{{ text.Day.intervalDay[0] }}
                            <el-input-number size="small" v-model="day.incrementIncrement" :min="1"
                                :max="31"></el-input-number>
                            {{ text.Day.intervalDay[1] }}
                            <el-input-number size="small" v-model="day.incrementStart" :min="1"
                                :max="31"></el-input-number>
                            {{ text.Day.intervalDay[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="day.cronEvery" label="4">{{ text.Day.specificWeek }}
                            <el-select size="small" multiple v-model="week.specificSpecific">
                                <el-option v-for="(val, index) in 7" :key="index" :label="text.Week[val - 1]"
                                    :value="['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][val - 1]"></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="day.cronEvery" label="5">{{ text.Day.specificDay }}
                            <el-select size="small" multiple v-model="day.specificSpecific">
                                <el-option v-for="(val, index) in 31" :key="index" :value="val">{{ val }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="6">{{ text.Day.lastDay }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="7">{{ text.Day.lastWeekday }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="8">{{ text.Day.lastWeek[0] }}
                            <el-select size="small" v-model="day.cronLastSpecificDomDay">
                                <el-option v-for="(val, index) in 7" :key="index" :label="text.Week[val - 1]"
                                    :value="val"></el-option>
                            </el-select>
                            {{ text.Day.lastWeek[1] || '' }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="9">
                            <el-input-number size="small" v-model="day.cronDaysBeforeEomMinus" :min="1"
                                :max="31"></el-input-number>
                            {{ text.Day.beforeEndMonth[0] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="10">{{ text.Day.nearestWeekday[0] }}
                            <el-input-number size="small" v-model="day.cronDaysNearestWeekday" :min="1"
                                :max="31"></el-input-number>
                            {{ text.Day.nearestWeekday[1] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="day.cronEvery" label="11">{{ text.Day.someWeekday[0] }}
                            <el-input-number size="small" v-model="week.cronNthDayNth" :min="1"
                                :max="5"></el-input-number>
                            <el-select size="small" v-model="week.cronNthDayDay">
                                <el-option v-for="(val, index) in 7" :key="index" :label="text.Week[val - 1]"
                                    :value="val"></el-option>
                            </el-select>
                            {{ text.Day.someWeekday[1] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> {{ text.Month.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio v-model="month.cronEvery" label="1">{{ text.Month.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="month.cronEvery" label="2">{{ text.Month.interval[0] }}
                            <el-input-number size="small" v-model="month.incrementIncrement" :min="0"
                                :max="12"></el-input-number>
                            {{ text.Month.interval[1] }}
                            <el-input-number size="small" v-model="month.incrementStart" :min="0"
                                :max="12"></el-input-number>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="month.cronEvery" label="3">{{ text.Month.specific }}
                            <el-select size="small" multiple v-model="month.specificSpecific">
                                <el-option v-for="(val, index) in 12" :key="index" :label="val"
                                    :value="val"></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="month.cronEvery" label="4">{{ text.Month.cycle[0] }}
                            <el-input-number size="small" v-model="month.rangeStart" :min="1"
                                :max="12"></el-input-number>
                            {{ text.Month.cycle[1] }}
                            <el-input-number size="small" v-model="month.rangeEnd" :min="1" :max="12"></el-input-number>
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> {{ text.Year.name }}</span>
                <div class="tabBody">
                    <el-row>
                        <el-radio v-model="year.cronEvery" label="1">{{ text.Year.every }}</el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="year.cronEvery" label="2">{{ text.Year.interval[0] }}
                            <el-input-number size="small" v-model="year.incrementIncrement" :min="1"
                                :max="99"></el-input-number>
                            {{ text.Year.interval[1] }}
                            <el-input-number size="small" v-model="year.incrementStart" :min="2018"
                                :max="2118"></el-input-number>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio class="long" v-model="year.cronEvery" label="3">{{ text.Year.specific }}
                            <el-select size="small" filterable multiple v-model="year.specificSpecific">
                                <el-option v-for="(val, index) in 100" :key="index" :label="2017 + val"
                                    :value="2017 + val"></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="year.cronEvery" label="4">{{ text.Year.cycle[0] }}
                            <el-input-number size="small" v-model="year.rangeStart" :min="2018"
                                :max="2118"></el-input-number>
                            {{ text.Year.cycle[1] }}
                            <el-input-number size="small" v-model="year.rangeEnd" :min="2018"
                                :max="2118"></el-input-number>
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="bottom">
            <span class="value">{{ this.cron }}</span>
            <el-button type="primary" @click="change">{{ text.Save }}</el-button>
            <el-button type="primary" @click="close">{{ text.Close }}</el-button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'vueCron',
    props: ['value', 'config'],
    model: { // 支持v-model
        prop: 'value',
        event: 'input'
    },
    data() {
        return {
            second: {
                cronEvery: '3',
                incrementStart: '3',
                incrementIncrement: '5',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: ['0'],
            },
            minute: {
                cronEvery: '',
                incrementStart: '3',
                incrementIncrement: '5',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: [],
            },
            hour: {
                cronEvery: '',
                incrementStart: '3',
                incrementIncrement: '5',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: [],
            },
            day: {
                cronEvery: '',
                incrementStart: '1',
                incrementIncrement: '1',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: [],
                cronLastSpecificDomDay: 1,
                cronDaysBeforeEomMinus: '',
                cronDaysNearestWeekday: '',
            },
            week: {
                cronEvery: '',
                incrementStart: 1,
                incrementIncrement: 1,
                specificSpecific: [],
                cronNthDayDay: 1,
                cronNthDayNth: '1',
            },
            month: {
                cronEvery: '',
                incrementStart: '3',
                incrementIncrement: '5',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: [],
            },
            year: {
                cronEvery: '',
                incrementStart: '2017',
                incrementIncrement: '1',
                rangeStart: '',
                rangeEnd: '',
                specificSpecific: [],
            },
            output: {
                second: '',
                minute: '',
                hour: '',
                day: '',
                month: '',
                Week: '',
                year: '',
            }
        }
    },
    watch: {
        value(newValue) {
            if (newValue) {
                this.parseCronExpression(newValue);
            } else {
                this.rest(this.$data);
            }
        }
    },

    mounted() {
        // 初始化时解析value值
        if (this.value) {
            this.parseCronExpression(this.value);
        }
    },
    computed: {
        text() {
            return this.$t('cron')
        },
        secondsText() {
            let seconds = '';
            let cronEvery = this.second.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    seconds = '*';
                    break;
                case '2':
                    seconds = this.second.incrementStart + '/' + this.second.incrementIncrement;
                    break;
                case '3':
                    this.second.specificSpecific.map(val => {
                        seconds += val + ','
                    });
                    seconds = seconds.slice(0, -1);
                    break;
                case '4':
                    seconds = this.second.rangeStart + '-' + this.second.rangeEnd;
                    break;
            }
            return seconds;
        },
        minutesText() {
            let minutes = '';
            let cronEvery = this.minute.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    minutes = '*';
                    break;
                case '2':
                    minutes = this.minute.incrementStart + '/' + this.minute.incrementIncrement;
                    break;
                case '3':
                    this.minute.specificSpecific.map(val => {
                        minutes += val + ','
                    });
                    minutes = minutes.slice(0, -1);
                    break;
                case '4':
                    minutes = this.minute.rangeStart + '-' + this.minute.rangeEnd;
                    break;
            }
            return minutes;
        },
        hoursText() {
            let hours = '';
            let cronEvery = this.hour.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    hours = '*';
                    break;
                case '2':
                    hours = this.hour.incrementStart + '/' + this.hour.incrementIncrement;
                    break;
                case '3':
                    this.hour.specificSpecific.map(val => {
                        hours += val + ','
                    });
                    hours = hours.slice(0, -1);
                    break;
                case '4':
                    hours = this.hour.rangeStart + '-' + this.hour.rangeEnd;
                    break;
            }
            return hours;
        },
        daysText() {
            let days = '';
            let cronEvery = this.day.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    break;
                case '2':
                case '4':
                case '11':
                    days = '?';
                    break;
                case '3':
                    days = this.day.incrementStart + '/' + this.day.incrementIncrement;
                    break;
                case '5':
                    this.day.specificSpecific.map(val => {
                        days += val + ','
                    });
                    days = days.slice(0, -1);
                    break;
                case '6':
                    days = "L";
                    break;
                case '7':
                    days = "LW";
                    break;
                case '8':
                    days = this.day.cronLastSpecificDomDay + 'L';
                    break;
                case '9':
                    days = 'L-' + this.day.cronDaysBeforeEomMinus;
                    break;
                case '10':
                    days = this.day.cronDaysNearestWeekday + "W";
                    break
            }
            return days;
        },
        weeksText() {
            let weeks = '';
            let cronEvery = this.day.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                case '3':
                case '5':
                    weeks = '?';
                    break;
                case '2':
                    weeks = this.week.incrementStart + '/' + this.week.incrementIncrement;
                    break;
                case '4':
                    this.week.specificSpecific.map(val => {
                        weeks += val + ','
                    });
                    weeks = weeks.slice(0, -1);
                    break;
                case '6':
                case '7':
                case '8':
                case '9':
                case '10':
                    weeks = "?";
                    break;
                case '11':
                    weeks = this.week.cronNthDayDay + "#" + this.week.cronNthDayNth;
                    break;
            }
            return weeks;
        },
        monthsText() {
            let months = '';
            let cronEvery = this.month.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    months = '*';
                    break;
                case '2':
                    months = this.month.incrementStart + '/' + this.month.incrementIncrement;
                    break;
                case '3':
                    this.month.specificSpecific.map(val => {
                        months += val + ','
                    });
                    months = months.slice(0, -1);
                    break;
                case '4':
                    months = this.month.rangeStart + '-' + this.month.rangeEnd;
                    break;
            }
            return months;
        },
        yearsText() {
            let years = '';
            let cronEvery = this.year.cronEvery;
            switch (cronEvery.toString()) {
                case '1':
                    years = '*';
                    break;
                case '2':
                    years = this.year.incrementStart + '/' + this.year.incrementIncrement;
                    break;
                case '3':
                    this.year.specificSpecific.map(val => {
                        years += val + ','
                    });
                    years = years.slice(0, -1);
                    break;
                case '4':
                    years = this.year.rangeStart + '-' + this.year.rangeEnd;
                    break;
            }
            return years;
        },
        cron() {
            const secondPart = (this.config && this.config.showSecond === false) ? '0' : (this.secondsText || '*');
            return `${secondPart} ${this.minutesText || '*'} ${this.hoursText || '*'} ${this.daysText || '*'} ${this.monthsText || '*'} ${this.weeksText || '?'} ${this.yearsText || '*'}`
        },
    },
    methods: {
        getValue() {
            return this.cron;
        },
        change() {
            this.$emit('change', this.cron);
            this.$emit('input', this.cron); // 支持v-model
            this.close();
        },
        close() {
            this.$emit('close')
        },
        rest(data) {
            for (let i in data) {
                if (data[i] instanceof Object) {
                    this.rest(data[i])
                } else {
                    switch (typeof data[i]) {
                        case 'object': data[i] = []; break;
                        case 'string': data[i] = ''; break;
                    }
                }
            }
        },

        // 解析cron表达式并设置相应的字段值
        parseCronExpression(expression) {
            if (!expression) return;

            // 按照空格分割cron表达式的各个部分
            const parts = expression.trim().split(/\s+/);

            // 标准cron表达式有7个部分：秒 分 时 日 月 周 年
            if (parts.length !== 7) return;

            const [secondPart, minutePart, hourPart, dayPart, monthPart, weekPart, yearPart] = parts;

            // 解析分钟部分
            this.parseTimePart(minutePart, 'minute');

            // 解析小时部分
            this.parseTimePart(hourPart, 'hour');

            // 解析日部分
            this.parseDayPart(dayPart);

            // 解析月部分
            this.parseTimePart(monthPart, 'month');

            // 解析周部分
            this.parseWeekPart(weekPart);

            // 解析年部分
            this.parseTimePart(yearPart, 'year');
        },

        // 解析时间部分（分钟、小时、月、年）
        parseTimePart(part, type) {
            const target = this[type];

            if (part === '*') {
                target.cronEvery = '1'; // 每
            } else if (part.includes('/')) {
                const [start, increment] = part.split('/');
                target.cronEvery = '2'; // 间隔
                target.incrementStart = start || '0';
                target.incrementIncrement = increment || '1';
            } else if (part.includes('-')) {
                const [start, end] = part.split('-');
                target.cronEvery = '4'; // 范围
                target.rangeStart = start;
                target.rangeEnd = end;
            } else if (part.includes(',')) {
                target.cronEvery = '3'; // 特定值
                target.specificSpecific = part.split(',');
            } else {
                // 单个值
                target.cronEvery = '3'; // 特定值
                target.specificSpecific = [part];
            }
        },

        // 解析日部分
        parseDayPart(part) {
            const day = this.day;

            if (part === '*') {
                day.cronEvery = '1'; // 每天
            } else if (part === '?') {
                // 与周配合使用，这里不做具体设置
                return;
            } else if (part.includes('/')) {
                const [start, increment] = part.split('/');
                day.cronEvery = '3'; // 间隔天数
                day.incrementStart = start || '1';
                day.incrementIncrement = increment || '1';
            } else if (part.includes(',')) {
                day.cronEvery = '5'; // 特定日期
                day.specificSpecific = part.split(',');
            } else if (part === 'L') {
                day.cronEvery = '6'; // 最后一天
            } else if (part === 'LW') {
                day.cronEvery = '7'; // 最后一个工作日
            } else if (part.includes('L-')) {
                day.cronEvery = '9'; // 月底前几天
                day.cronDaysBeforeEomMinus = part.split('-')[1];
            } else if (part.includes('W')) {
                day.cronEvery = '10'; // 最近的工作日
                day.cronDaysNearestWeekday = part.replace('W', '');
            } else if (part.includes('-')) {
                const [start, end] = part.split('-');
                day.cronEvery = '1'; // 简化处理为每天
            } else {
                // 单个日期
                day.cronEvery = '5'; // 特定日期
                day.specificSpecific = [part];
            }
        },

        // 解析周部分
        parseWeekPart(part) {
            const day = this.day;
            const week = this.week;

            if (part === '?') {
                // 与日配合使用，这里不做具体设置
                return;
            } else if (part.includes('/')) {
                day.cronEvery = '2'; // 间隔周几
                const [start, increment] = part.split('/');
                week.incrementStart = this.getWeekValue(start);
                week.incrementIncrement = increment || '1';
            } else if (part.includes(',')) {
                day.cronEvery = '4'; // 特定周几
                week.specificSpecific = part.split(',').map(w => this.getWeekValue(w));
            } else if (part.includes('#')) {
                day.cronEvery = '11'; // 第几个周几
                const [weekday, nth] = part.split('#');
                week.cronNthDayDay = this.getWeekValue(weekday);
                week.cronNthDayNth = nth;
            } else {
                // 单个周几
                day.cronEvery = '4'; // 特定周几
                week.specificSpecific = [this.getWeekValue(part)];
            }
        },

        // 获取周的值（转换为数字或保持英文缩写）
        getWeekValue(weekStr) {
            const weekMap = {
                'SUN': 1,
                'MON': 2,
                'TUE': 3,
                'WED': 4,
                'THU': 5,
                'FRI': 6,
                'SAT': 7
            };

            if (weekMap[weekStr.toUpperCase()]) {
                return weekMap[weekStr.toUpperCase()];
            }
            return weekStr;
        }
    }
}</script>
