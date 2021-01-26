<template>
  <el-row type="flex" justify="center">
    <el-col :span="18" :xs="23">
      <div style="margin-top: 60px;">
          <img width="50" height="50" src="~/assets/icon.png" style="margin-top:-6px; margin-left:5px;"/>
          <el-tooltip effect="dark" content="Device Tracking" placement="top">
            <el-button
            style="float: right;"
            type="primary"
            icon="el-icon-mobile-phone"
            circle
            @click="getItemType('devices')"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="Book Tracking" placement="top">
            <el-button
            style="float: right; margin-right:20px;"
            type="primary"
            icon="el-icon-notebook-1"
            circle
            @click="getItemType('books')"
            >
            </el-button>
          </el-tooltip>
      </div>

      <!-- Start form to add item in Admin -->
      <div v-if="this.$route.query.role === 'admin'" style="margin: 50px 0px 50px 0px">
        <el-form @submit.native.prevent>
        <el-input
          placeholder="Please input a item to the list..."
          v-model="itemData"
          class="input"
          @keyup.enter.native="onSubmit"
        >
          <el-button
            type="primary"
            slot="append"
            icon="el-icon-plus"
            @click="onSubmit"
          ></el-button>
        </el-input>
        </el-form>
      </div>
      <!-- End form to add item in Admin -->

      <!-- Hide table in peding stage -->
      <p v-if="$fetchState.pending"></p>
      <el-table
        v-else
        :data="filterData(itemList)"
        :empty-text="messages.empty_list"
        style="width: 100%"
      >
        <el-table-column min-width="200"
        :label="capitalizeFirstLetter(this.itemType)"
         prop="name"
        >
        </el-table-column>
        <el-table-column label="Availability" align="center">
          <template slot-scope="scope">
            <el-tooltip v-if="(scope.row.borrower)" class="item" effect="dark" :content="messages.tooltip.unavailable" placement="right">
              <div>
                <i class="el-icon-error" style="font-size:18px; color: #F56C6C;"></i>
                <div>({{ scope.row.borrower }})</div>
              </div>
            </el-tooltip>
            <el-tooltip v-else class="item" effect="dark" :content="messages.tooltip.available" placement="right">
              <i class="el-icon-success" style="font-size:18px; color: #67C23A;"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Action">
          <template slot-scope="scope">
            <!-- Start Admin Permission -->
            <div v-if="$route.query.role === 'admin'">
              <el-button
              round
              size="mini"
              type="danger"
              @click="removeItem(scope.row)"
              >
                Remove
              </el-button>
            </div>
            <!-- End Admin Permission -->
            <div v-else>
            <el-button
              v-if="!scope.row.borrower"
              round
              size="mini"
              @click="openBorrowDialog(scope.row)"
              >
                Borrow
            </el-button>
            <el-button
              v-if="scope.row.borrower"
              round
              size="mini"
              type="danger"
              @click="returnItem(scope.row)"
              >
                Return
            </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        title="Borrow Information"
        custom-class="borrow-information"
        :visible.sync="showBorrowInformationDialog"
        @opened="setAutoFocus"
        >
        <el-form :model="borrowInformationForm" @submit.native.prevent>
          <el-form-item label="Item ID : " :label-width="formLabelWidth">
            {{ borrowInformationForm.id }}
          </el-form-item>
          <el-form-item
          label="Item : "
          :label-width="formLabelWidth"
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {{ borrowInformationForm.name }}
          </el-form-item>
          <el-form-item label="Borrower : " :label-width="formLabelWidth">
            <el-input
              ref="borrower"
              size="medium"
              v-model="borrowInformationForm.borrower"
              autocomplete="off"
              @keyup.enter.native="updateBorrowInformation(borrowInformationForm)"
            >
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showBorrowInformationDialog = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="updateBorrowInformation(borrowInformationForm)"
          >
            Confirm
          </el-button>
        </span>
      </el-dialog>

    </el-col>
  </el-row>
</template>

<script>
import { Loading } from "element-ui";
export default {
  data() {
    return {
      messages: {
        tooltip: {
          available: "This item is available",
          unavailable: "This item is unavailable",
        },
        empty_list: "Sorry, we couldn't find what you were looking for...",
      },
      itemList: [],
      itemType: "books", // @TODO : Get list of item from firebase instead of hardcoded
      itemData: "",
      search: "",
      showBorrowInformationDialog: false,
      formLabelWidth: "35%",
      borrowInformationForm: {
        id: "",
        borrower: "",
        item: "",
        type: "",
      },
    };
  },

  // @TODO : Remove this part later...
  watch: {
    '$route.query': '$fetch'
  },

  computed: {
    isValidatedForm() {
      return this.itemData != '';
    },
  },

  async fetch() {
    let londingScreen = Loading.service({ fullscreen: true });
    let itemType = `items/${this.itemType}`;
    let getItemList = await this.$fireDb.ref(itemType).once("value");
    try {
      this.itemList = (getItemList.val())
      ? Object.values(getItemList.val())
      : [];
    } catch (e) {
      console.log(e);
      return;
    }
    londingScreen.close();
  },

  methods: {
    getItemType(itemType) {
      this.itemType = itemType;
      this.$fetch();
    },

    addZero(dataTime) {
      if (dataTime < 10) {
        dataTime = "0" + dataTime;
      }
      return dataTime;
    },

    getKey() {
      let currentDatetime = new Date();
      let year = currentDatetime.getFullYear();
      let monthList = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      let month = monthList[currentDatetime.getMonth()];
      var timeStamp = currentDatetime.getTime();

      return { year: year, month: month, timeStamp: timeStamp };
    },

    async onSubmit() {
      if (this.itemData === '') {
        return false;
      }

      let key = this.getKey();
      let itemData = {
        id: key.timeStamp,
        name: this.itemData,
        isBorrowed: false,
        borrower: null,
      };

      try {
        await this.$fireDb.ref(`items/${this.itemType}/${key.timeStamp}`).set(itemData);
      } catch (e) {
        console.log(e);
        return;
      }

      // Referh data
      this.itemData = "";
      this.$fetch();
    },

    async updateBorrowInformation(data) {
      if (data.borrower === '') {
        return false;
      }

      let info = {
        borrower: data.borrower,
        isBorrowed: true
      }

      try {
        await this.$fireDb.ref(`items/${this.itemType}/${data.id}`).update(info);
      } catch (e) {
        console.log(e);
        return;
      }
      // Clear borrow information
      this.showBorrowInformationDialog = false;
      this.borrowInformationForm.borrower = '';
      this.$fetch();
    },

    async returnItem(data) {
      let info = {
        borrower: null,
        isBorrowed: false
      }

      try {
        await this.$fireDb.ref(`items/${this.itemType}/${data.id}`).update(info);
      } catch (e) {
        console.log(e);
        return;
      }
      this.$fetch();
    },

    async removeItem(data) {
      try {
        await this.$fireDb.ref(`items/${this.itemType}/${data.id}`).remove();
      } catch (e) {
        console.log(e);
        return;
      }
      this.$fetch();
    },

    openBorrowDialog(data) {
      this.borrowInformationForm.id = data.id;
      this.borrowInformationForm.name = data.name;
      this.borrowInformationForm.type = '';
      this.showBorrowInformationDialog = true;
    },

    capitalizeFirstLetter(string) {
      return string.replace(/^./, string[0].toUpperCase());
    },

    setAutoFocus() {
      this.$refs.borrower.focus();
    },

    filterData(itemList) {
       let result = itemList.filter(
            (data) => {

              if (data.borrower) {
                return !this.search ||
                data.name.toLowerCase().includes(this.search.toLowerCase()) ||
                data.borrower.toLowerCase().includes(this.search.toLowerCase())
              }

              return !this.search || data.name.toLowerCase().includes(this.search.toLowerCase());
            }
        );

        return result;
    },

    async sendNotification() {
      // @TODO : Send request to clound function for security
    }

  },
};
</script>
<style>

.el-table .cell {
  line-height: 1.4;
  word-break: normal;
}

.el-form-item__label {
  text-align: left;
}

@media only screen and (max-width: 768px) {
  .el-form-item__label {
    width: 25% !important;
  }

  .borrow-information {
    width: 95%;
  }
}

</style>
