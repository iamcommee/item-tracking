<template>
  <el-row type="flex" justify="center">
    <el-col :span="18" :xs="22">
      <div style="margin-top: 60px;">
          <img width="50" height="50" src="~/assets/icon.png" style="margin-top:-6px; margin-left:5px;"/>
          <!-- <el-tooltip effect="dark" content="Device Tracking" placement="top">
            <el-button
            style="float: right;"
            :type="this.itemType === 'devices' ? 'primary' : ''"
            icon="el-icon-mobile-phone"
            circle
            @click="getItemType('devices')"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="Book Tracking" placement="top">
            <el-button
            style="float: right; margin-right:20px;"
            :type="this.itemType === 'books' ? 'primary' : ''"
            icon="el-icon-notebook-1"
            circle
            @click="getItemType('books')"
            >
            </el-button>
          </el-tooltip> -->
      </div>

      <!-- Start form to add item in Admin -->
      <div v-if="isAdmin" style="margin: 50px 0px 50px 0px">
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
        :default-sort="{prop: 'name'}"
        :empty-text="messages.empty_list"
        style="width: 100%"
        @row-click="getItemInfoFromIsbn"
      >
        <el-table-column min-width="200"
        sortable
        :label="this.itemType | capitalize"
         prop="name"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
            <ul v-if="scope.row.tags" class="tags-list">
              <li v-for="tag in scope.row.tags" :key="tag.id" class="tag-item">
                #{{ tag }}
              </li>
            </ul>
          </template>
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
        <el-table-column align="center" label="Actions">
          <template slot-scope="scope">
            <!-- Start Admin Permission -->
            <div v-if="isAdmin">
              <el-button round size="mini"
                @click="openEditDialog(scope.row)">
                Edit
              </el-button>
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
        <el-form :model="borrowInformationForm"
          label-position="top"
          @submit.native.prevent>
          <el-form-item label="Your name: " :label-width="formLabelWidth">
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
        <div slot="title" class="dialog-text">
          Borrowing <em>{{ borrowInformationForm.name }}</em>.
        </div>
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

      <el-dialog title="Edit item"
        :visible.sync="showEditDialog">
        <el-form :model="selectedItem" label-position="top">
          <el-form-item label="Name">
            <el-input v-model="selectedItem.name"></el-input>
          </el-form-item>
          <el-form-item label="Tags (comma-separated)">
            <el-input v-model="selectedItem.tags"></el-input>
          </el-form-item>
          <el-form-item label="Borrower">
            <el-input v-model="selectedItem.borrower"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="showEditDialog = false">Cancel</el-button>
          <el-button type="primary" @click="updateItem(selectedItem)">Save</el-button>
        </div>
      </el-dialog>

      <el-dialog
        title="Item Information"
        custom-class="borrow-information"
        :visible.sync="showItemInformationDialog"
        >
        <div slot="title" class="dialog-text">
          <em>{{ itemInformation.title }}</em>.
        </div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="6">
             <img :src="itemInformation.thumbnail_url">
          </el-col>
        </el-row>
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
      showEditDialog: false,
      selectedItem: {
        id: "",
        borrower: "",
        item: "",
        type: "",
        tags: ""
      },
      showItemInformationDialog: false,
      itemInformation: {
        title: "",
        thumbnail_url: "",
        authors: ""
      }
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
    isAdmin() {
      return this.$route.query.role === 'admin'
    }
  },

  async fetch() {
    let londingScreen = Loading.service({ fullscreen: true });
    let itemType = `items/${this.itemType}`;
    let getItemList = await this.$fireDb.ref(itemType).once("value");
    try {
      this.itemList = (getItemList.val())
      ? Object.values(getItemList.val())
      : [];
      console.log(this.itemList);
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

    async updateItem(data) {
      const item =  {
        name: data.name,
        tags: data.tags.split(',').map(tag => tag.trim())
      };

      if (data.borrower) {
        item.borrower = data.borrower;
      }

      try {
        await this.$fireDb.ref(`items/${this.itemType}/${data.id}`).update(item);
        this.showEditDialog = false;
        this.$message({
          type: 'success',
          message: 'The item has been updated.',
          duration: 5000
        });

      } catch (e) {
        this.$message({
          type: 'danger',
          message: 'The item has been not updated.',
          duration: 5000
        });
        console.error(e);
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

    openEditDialog(item) {
      const tags = item.tags || [];
      this.selectedItem = {
        id: item.id,
        name: item.name,
        type: item.type,
        tags: tags.join(', '),
        borrower: item.borrower
      }
      this.showEditDialog = true;
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
    },

    async getItemInfoFromIsbn (row) {
      if(row.isbn){
        let res = await this.$axios.$get(`https://openlibrary.org/api/books?bibkeys=ISBN:${row.isbn}&jscmd=details&format=json`)
        this.itemInformation.title = res[`ISBN:${row.isbn}`]['details']['title']
        this.itemInformation.thumbnail_url = res[`ISBN:${row.isbn}`]['thumbnail_url'].replace('-S', '-M')
        this.showItemInformationDialog = true;
      }
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
  line-height: 1;
}

@media only screen and (max-width: 768px) {
  .borrow-information {
    width: 95%;
  }
}

.dialog-text {
  font-size: 1.2rem;
}

.dialog-text em {
  font-weight: bold;
}

.el-dialog__body {
  padding-top: 20px;
  padding-bottom: 0;
}

.tags-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.tag-item {
  flex-basis: auto;
  color: #b9b9d9;
  font-size: 0.9em;
}

.tag-item:not(:last-child) {
  margin-right: 0.5em;
}

</style>
